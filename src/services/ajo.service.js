const httpStatus = require("http-status");
const genericRepo = require("../dbservices");
const { abortIf } = require("../utils/responder");
const moment = require("moment");
const sendEmail = require("../utils/email.util");

class AjoService {
  static create = async ({
    auth: { id },
    body: {
      monthlyContribution,
      startDate,
      endDate,
      numberOfMonths,
      position,
      frequecy = "daily",
    },
  }) => {
    await genericRepo
      .setOptions("Ajo", {
        data: {
          monthlyContribution,
          startDate: moment(startDate).format("MM/DD/YYYY", "YYYY-MM-DD"),
          endDate: moment(endDate).format("MM/DD/YYYY", "YYYY-MM-DD"),
          numberOfMonths,
          frequecy,
          memberPositions: [
            {
              member: id,
              creator: true,
              position,
            },
          ],
          creator: id,
        },
      })
      .create();
    return {
      message: "Created Successfully.",
    };
  };

  static invite = async ({ auth: { id }, ajoId, body }) => {
    const ajo = await genericRepo
      .setOptions("Ajo", {
        condition: {
          _id: ajoId,
          "memberPositions.member": id,
          "memberPositions.creator": true,
        },
      })
      .findOne();
    abortIf(body.length < 1, httpStatus.BAD_REQUEST, "body cannot be empty");
    for (var item of body) {
      const user = await genericRepo
        .setOptions("Members", {
          condition: {
            _id: item,
          },
        })
        .findOne();
      await genericRepo
        .setOptions("AjoInvitations", {
          data: {
            member: item,
            ajo: ajoId,
          },
        })
        .create();
      sendEmail({
        to: user.email,
        subject: "Ajo Invitation",
        context: {
          firstname: user.firstname,
          message: `You have been invited to ${ajo?.name} ajo`,
        },
      });
    }
    return {
      message: "Invitation Sent.",
    };
  };

  static getAllPendingInvitations = async ({
    auth: { id },
    paginateOptions,
  }) => {
    const ajoInvitations = await genericRepo
      .setOptions("AjoInvitations", {
        condition: { member: id, response: "pending" },
        inclussions: ["ajo", "ajo.creator"],
        paginateOptions,
      })
      .findAllAndPagination();
    return ajoInvitations;
  };

  static getAllRuningAjo = async ({ auth: { id }, paginateOptions }) => {
    const ajo = await genericRepo
      .setOptions("Ajo", {
        condition: {
          "memberPositions.member": id,
          status: { $in: ["lobby", "ongoing"] },
        },
        inclussions: ["memberPositions.member", "creator"],
        paginateOptions,
      })
      .findAllAndPagination();
    return ajo;
  };

  static acceptRejectInvitation = async ({
    auth: { id },
    ajoIvId,
    action,
    position,
  }) => {
    const user = await genericRepo
      .setOptions("Members", {
        condition: {
          _id: id,
        },
      })
      .findOne();
    const ajoInvitation = await genericRepo
      .setOptions("AjoInvitations", {
        condition: {
          _id: ajoIvId,
        },
        inclussions: ["ajo"],
      })
      .findOne();
    const {
      ajo: { _id },
    } = ajoInvitation;
    let ajo_ = await genericRepo
      .setOptions("Ajo", {
        condition: { _id },
      })
      .findOne();
    if (action === "accepted") {
      ajo_.memberPositions = [
        ...ajo_.memberPositions,
        { member: user._id, creator: false, position },
      ];
      await ajo_.save();
      await genericRepo
        .setOptions("AjoInvitations", {
          condition: {
            _id: ajoIvId,
          },
          changes: {
            response: action,
          },
        })
        .update();
    } else {
      await genericRepo
        .setOptions("AjoInvitations", {
          condition: {
            _id: ajoIvId,
          },
          changes: {
            response: "rejected",
          },
        })
        .update();
    }
    return {
      message: `Invitation ${action} successfully.`,
    };
  };

  static updateAjo = async ({ auth: { id }, updates, params: { ajoId } }) => {
    const ajo = await genericRepo
      .setOptions("Ajo", {
        condition: {
          creator: id,
          _id: ajoId,
        },
      })
      .findOne();
    let newArray = [];
    if (updates.numberOfMonths !== ajo.numberOfMonths) {
      let position_ = 1;
      for (let item of ajo.memberPositions) {
        let { position, ...rest } = item;
        item.position = position;

        newArray.push({
          position: position_,
          ...rest,
        });
        position_ = position_ + 1;
      }
    }
    ajo.memberPositions = newArray;
    await ajo.save();
    await genericRepo
      .setOptions("Ajo", {
        condition: {
          creator: id,
          _id: ajoId,
        },
        changes: {
          ...updates,
        },
      })
      .update();
    return {
      message: "Updated successfully.",
    };
  };

  static activateAjo = async ({ auth: { id }, params: { ajoId } }) => {
    let ajo = await genericRepo
      .setOptions("Ajo", {
        condition: {
          creator: id,
          _id: ajoId,
          status: "lobby",
        },
      })
      .findOne();
    abortIf(!ajo, httpStatus.NOT_FOUND, "Ajo does not exist.");
    ajo.status = "ongoing";
    let pos = Infinity,
      nexBillingData = {};
    for (let item of ajo.memberPositions) {
      if (pos > item.position) {
        pos = item.position;
        nexBillingData.collector = item.member;
        nexBillingData.date = ajo.startDate;
      }
    }
    ajo.nextBillingData = nexBillingData;
    await ajo.save();
    return {
      message: "Ajo has started.",
    };
  };
}

module.exports = AjoService;
