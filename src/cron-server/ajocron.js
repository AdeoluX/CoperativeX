const cron = require("node-cron");
const genericRepo = require("../dbservices");
const moment = require("moment");
const { CronTime } = require("cron-time-generator");
const sendEmail = require("../utils/email.util");
const { generateRandomString } = require("../utils/utils.utils");
const mongoose = require("mongoose");
const txnWallBatch = require("../utils/transactionWallet.utils");

cron.schedule(CronTime.everyTuesdayAt([15], [6]), async function () {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log("running a task ecery minute");

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day
    // Create the start and end of today's date range
    const startOfDay = moment();
    const endOfDay = moment().add(23, "hours").add(59, "minute");

    const dueAjos = await genericRepo
      .setOptions("Ajo", {
        condition: {
          status: "ongoing",
          "nextBillingData.date": {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      })
      .findAll();
    let contributedAmount = 0;
    for (let item of dueAjos) {
      // get all participants
      if (
        moment(item.nextBillingData.date).isSameOrBefore(item.endDate) &&
        !item.completed
      ) {
        const collector = item._doc.nextBillingData.collector;
        const participants = item.memberPositions;
        for (let pItem of participants) {
          const pWallet = await genericRepo
            .setOptions("Wallet", {
              condition: {
                member: pItem.member,
                currency: "NGN",
              },
            })
            .findOne();
          if (pWallet.ledger_balance < item._doc.monthlyContribution) {
            //send email to wallet holder
            const user = await genericRepo
              .setOptions("Members", {
                condition: {
                  _id: pWallet.member,
                },
              })
              .findOne();
            //LOG UNPAID AJO.
            await genericRepo
              .setOptions("UnpaidAjo", {
                data: {
                  member: pWallet.member,
                  amount: Number(item._doc.monthlyContribution),
                  collector,
                },
                transaction: { session },
              })
              .create();
            // Send Email
            await sendEmail({
              to: user.email,
              subject: "Please Fund Wallet for Ajo Debit.",
              context: {
                firstname: user.firstname,
                message: `<p>Hi ${user.firstname}</p>
                                    <br>
                                    <p>Please fund your wallet with ${item.monthlyContribution}, so it can be debited for Ajo.</p>
                                    <br>
                            `,
              },
            });
            continue;
          } else {
            contributedAmount = contributedAmount + item.monthlyContribution;
            const pWallet = await genericRepo
              .setOptions("Wallet", {
                condition: {
                  member: pItem.member,
                  currency: "NGN",
                },
              })
              .findOne();
            await txnWallBatch({
              transaction: {
                wallet_id: pWallet._id,
                member: pItem.member,
                amount: Number(item.monthlyContribution),
                type: "DR",
                currency: "NGN",
                description: "Ajo Payment",
                reference: `AJP-${generateRandomString(10, "alpha")}`,
                status: "success",
              },
              wallet: pWallet,
              type: "DR",
            });
          }
        }
        const collectorWallet = await genericRepo
          .setOptions("Wallet", {
            condition: {
              member: collector,
              currency: "NGN",
            },
          })
          .findOne();
        //create Transaction
        await txnWallBatch({
          transaction: {
            wallet_id: collectorWallet._id,
            member: collectorWallet.member,
            amount: Number(contributedAmount),
            type: "CR",
            currency: "NGN",
            description: "Ajo Payment",
            reference: `AJP-${generateRandomString(10, "alpha")}`,
            status: "success",
          },
          wallet: collectorWallet,
        });

        //update the Ajo nexBilling Data
        /** find position of nextBillingData */
        // const position = item._doc.nextBillingData.collector
        const arr1 = await item.memberPositions;
        let position;
        for (let _item of participants) {
          if (
            _item.member._id.toString() ==
            item._doc.nextBillingData.collector._id.toString()
          ) {
            position = _item.position;
            break;
          }
        }

        const newPosition = position + 1;
        let newCollector;
        //Go through the participants array
        for (let counter of participants) {
          if (counter.position === newPosition) {
            newCollector = counter.member;
          }
        }
        //set new NextBillingData
        const newNextBillingData = {
          collector: newCollector,
          date: moment().add(1, "month").startOf("day"),
        };
        //update Ajo with new billing details
        await genericRepo
          .setOptions("Ajo", {
            condition: {
              _id: item._id,
            },
            changes: {
              $inc: { roundsGone: 1 },
              nextBillingData: newNextBillingData,
            },
          })
          .update();
      } else {
        continue;
      }
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

//resolve unpaid Ajos
cron.schedule(CronTime.everyHour(), async function () {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    console.log("Cron Time Works");
    const unpaidAjos = await genericRepo
      .setOptions("UnpaidAjo", {
        condition: {
          status: false,
        },
      })
      .findAll();

    for (let item of unpaidAjos) {
      const collector = await genericRepo
        .setOptions("Members", {
          condition: {
            _id: item.collector,
          },
        })
        .findOne();
      const debtor = await genericRepo
        .setOptions("Members", {
          condition: {
            _id: item.member,
          },
        })
        .findOne();
      //get their wallets
      const debtorsWallet = await genericRepo
        .setOptions("Wallet", {
          condition: {
            member: debtor._id,
          },
        })
        .findOne();
      if (item.amount > debtorsWallet.ledger_balance) continue;
      await txnWallBatch({
        transaction: {
          wallet_id: debtorsWallet._id,
          member: debtorsWallet.member,
          amount: Number(item.amount),
          type: "DR",
          currency: "NGN",
          descriptions: "Ajo Payment",
          reference: `AJP-${generateRandomString(10, "alpha")}`,
          status: "success",
        },
        wallet: debtorsWallet,
        type: "DR",
      });

      const collectorsWallet = await genericRepo
        .setOptions("Wallet", {
          condition: {
            member: collector._id,
          },
        })
        .findOne();
      await txnWallBatch({
        transaction: {
          wallet_id: collectorsWallet._id,
          member: collectorsWallet.member,
          amount: Number(item.amount),
          type: "DR",
          currency: "NGN",
          descriptions: "Ajo Payment",
          reference: `AJP-${generateRandomString(10, "alpha")}`,
          status: "success",
        },
        wallet: collectorsWallet,
        type: "CR",
      });
      await genericRepo
        .setOptions("UnpaidAjo", {
          condition: {
            _id: item._id,
          },
          changes: {
            status: true,
          },
        })
        .update();
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
});

module.exports = cron;
