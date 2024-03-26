const mongoose = require("mongoose");
const genericRepo = require("../dbservices");

const txnWallBatch = async ({ transaction, wallet, type }) => {
  const newObjectId = mongoose.Types.ObjectId();
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await genericRepo
      .setOptions("Transactions", {
        data: {
          ...transaction,
          _id: newObjectId,
        },
        transaction: { session },
      })
      .create();
    const { transactions, _doc } = wallet;
    await genericRepo
      .setOptions("Wallet", {
        condition: {
          _id: _doc._id,
        },
        changes: {
          $inc: {
            ledger_balance:
              type === "DR"
                ? -Number(transaction.amount)
                : Number(transaction.amount),
          },
          ...(transactions.length > 0
            ? { transactions: [...transactions, newObjectId] }
            : { transactions: [newObjectId] }),
        },
        transaction: session,
      })
      .update();
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    await session.endSession();
    return;
  }
};

module.exports = txnWallBatch;
