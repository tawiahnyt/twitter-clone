/** @format */

import Notification from "../models/notification.Model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in getNotifications function", error);
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteNotification function", error);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in deleteNotification function", error);
  }
};
