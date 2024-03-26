import Event from "../models/events.js";
import Payment from "../models/payments.js";
import User from "../models/users.js";

export async function handleEventById(req, res) {
  const { eventId } = req.params;
  const { userId } = req.body;
  console.log(eventId, userId);
  try {
    const event = await Event.findOne({
      _id: eventId,
    });

    if (event) {
      if (event.price == "Free") {
        const isRegistered = await User.findOne({
          $and: [{ _id: userId }, { "events.eventId": eventId }],
        });
        if (isRegistered) {
          res.json({ event: event, payment: "Done", registration: "Done" });
        } else {
          res.json({
            event: event,
            payment: "Done",
            registration: "Not Done",
          });
        }
      } else {
        const isPaid = await Payment.findOne({
          $and: [{ userId }, { eventId }],
        });

        if (isPaid) {
          const isRegistered = await User.findOne({
            $and: [{ _id: userId }, { "events.eventId": eventId }],
          });

          if (isRegistered) {
            res.json({ event: event, payment: "Done", registration: "Done" });
          } else {
            res.json({
              event: event,
              payment: "Done",
              registration: "Not Done",
            });
          }
        } else {
          const isRegistered = await User.findOne({
            $and: [{ _id: userId }, { "events.eventId": eventId }],
          });

          if (isRegistered) {
            res.json({ event: event, payment: "Done", registration: "Done" });
          } else {
            res.json({
              event: event,
              payment: "Not Done",
            });
          }
        }
      }
    } else {
      res.json("notExists");
    }
  } catch (error) {
    res.json("notExists");
  }
}

export async function handleAllEvent(req, res) {
  try {
    const events = await Event.find();
    if (events) {
      res.json(events);
    } else {
      res.json("notExists");
    }
  } catch (error) {
    res.json("notExists");
  }
}
