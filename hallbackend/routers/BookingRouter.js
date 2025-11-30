const Booking = require("../models/BookingModel");
const express = require("express");
const Hall = require("../models/HallModel");
const Dept = require("../models/DepartmentModel")
const BookingRouter = express.Router();
const { sendBookingMail, sendMultipleEmails } = require("../utils/mailer");
const { protect } = require("../middleware/protect");
const UserModel = require("../models/UserModel");


BookingRouter.post("/bookings", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      Department,
      hallName,
      MeetingDescription,
      bookingDate,
      fromDate,
      toDate,
      startTime,
      endTime
    } = req.body.formData;
    console.log(Department)
    const department = await Dept.findById(Department);
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    const hall = await Hall.findOne({ hallName, department: department._id, isActive: true });
    if (!hall) {
      await sendBookingMail({
        to: req.user.email,
        subject: `Hall Booking Failed - ${hallName}`,
        text: `Sorry, the hall "${hallName}" is not available or inactive. Please try another.`
      });
      return res.status(400).json({ error: "Hall not found or inactive." });
    }

    // Create a list of booking dates
    let dates = [];
    if (fromDate && toDate) {
      let current = new Date(fromDate);
      const end = new Date(toDate);
      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    } else if (bookingDate) {
      dates.push(new Date(bookingDate));
    } else {
      return res.status(400).json({ error: "No booking date or date range provided." });
    }
    const bookings = [];

    for (const date of dates) {
      const overlap = await Booking.findOne({
        hall: hall._id,
        bookingDate: date,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ],
        status: { $in: ["pending", "approved"] }
      });

      if (overlap) {
        return res.status(400).json({
          message: `Hall already booked on ${date.toDateString()} from ${startTime} to ${endTime}`
        });
      }

      const newBooking = await Booking.create({
        name,
        email: req.user._id,
        Department,
        hall: hall._id,
        MeetingDescription,
        bookingDate: date,
        startTime,
        endTime,
        status: "pending"
      });
      bookings.push(newBooking);
    }


    // Send confirmation emails in parallel for better performance
    console.log(department.DeptName);
    const admin = await UserModel.findOne({ DeptName: department.DeptName, role: "admin" });
    console.log(admin);

    // Prepare emails for parallel sending
    const emailsToSend = [
      {
        to: req.user.email,
        subject: `Hall Booking Confirmation - ${hallName}`,
        text: `Your booking(s) for hall "${hallName}" from ${startTime} to ${endTime} ${
          dates.length > 1
            ? `on multiple days from ${fromDate} to ${toDate}`
            : `on ${bookingDate}`
        } is confirmed (status: pending).`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 30px;">
              <h2 style="color: #2c3e50;">🎉 Hall Booking Confirmed!</h2>
              <p style="font-size: 16px; color: #333;">Hello <strong>${req.user.name}</strong>,</p>
              
              <p style="font-size: 16px;">
                Your booking for the hall <strong>"${hallName}"</strong> has been successfully received and is currently <span style="color: orange; font-weight: bold;">Pending Approval</span>.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

              <p><strong>🕒 Time Slot:</strong> ${startTime} to ${endTime}</p>
              <p><strong>📅 Booking ${dates.length > 1 ? 'Dates' : 'Date'}:</strong> ${dates.length > 1 ? `${fromDate} to ${toDate}` : bookingDate}</p>

              <p style="margin-top: 20px; font-size: 14px; color: #555;">
                You will receive another email once the booking is approved or rejected by the admin.
              </p>

              <p style="margin-top: 30px; font-size: 12px; color: #999;">
                📬 This is an automated message from the Hall Booking System. Please do not reply to this email.
              </p>
            </div>
          </div>
        `
      }
    ];

    // Add admin email only if admin exists
    if (admin && admin.email) {
      emailsToSend.push({
        to: admin.email,
        subject: `New Hall Booking Request - ${hallName}`,
        text: `A new hall booking request has been made and requires your approval.

Hall: ${hallName}
Booked By: ${name}
Email: ${req.user.email}
Department: ${department.DeptName}
Meeting Description: ${MeetingDescription || "Not provided"}
Time Slot: ${startTime} to ${endTime}
Booking ${dates.length > 1 ? "Dates" : "Date"}: ${dates.length > 1 ? `${fromDate} to ${toDate}` : `${bookingDate}`}
Status: Pending Approval

Please review this booking request and approve or reject it in the admin dashboard.

Visit: https://hall-management-sandy.vercel.app/`,
        html: `
          <div style="max-width: 600px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #34495e; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">📌 Hall Booking Request</h2>
            <table style="width: 100%; margin-top: 20px; color: #2c3e50;">
              <tr>
                <td style="padding: 8px;"><strong>🏛️ Hall:</strong></td>
                <td style="padding: 8px;">${hallName}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>👤 Booked By:</strong></td>
                <td style="padding: 8px;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>📧 Email:</strong></td>
                <td style="padding: 8px;">${req.user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>🏫 Department:</strong></td>
                <td style="padding: 8px;">${department.DeptName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; vertical-align: top;"><strong>📝 Meeting Description:</strong></td>
                <td style="padding: 8px;">${MeetingDescription || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>⏰ Time Slot:</strong></td>
                <td style="padding: 8px;">${startTime} to ${endTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>📅 ${dates.length > 1 ? "Booking Dates" : "Booking Date"}:</strong></td>
                <td style="padding: 8px;">
                  ${dates.length > 1 ? `${fromDate} to ${toDate}` : `${bookingDate}`}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px;"><strong>📌 Status:</strong></td>
                <td style="padding: 8px; color: #e67e22; font-weight: bold;">Pending Approval ✅</td>
              </tr>
            </table>
            <p style="margin-top: 30px; font-size: 15px;">
              Please review this booking request and approve or reject it in the admin dashboard.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://hall-management-sandy.vercel.app/" 
                 style="display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 10px;">
                Go to Admin Dashboard
              </a>
            </div>
            <div style="text-align: center; margin: 20px 0; padding: 15px; background-color: #ecf0f1; border-radius: 5px;">
              <p style="margin: 0; font-size: 14px; color: #2c3e50; font-weight: bold;">🔗 Click here to access the dashboard:</p>
              <p style="margin: 10px 0 0 0; font-size: 16px;">
                <a href="https://hall-management-sandy.vercel.app/" style="color: #3498db; text-decoration: underline; font-weight: bold;">https://hall-management-sandy.vercel.app/</a>
              </p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dcdcdc;" />
            <p style="font-size: 12px; color: #999; text-align: center;">
              📬 This is an automated message from the Hall Booking System. Please do not reply.
            </p>
          </div>
        `
      });
    } else {
      console.warn(`No admin found for department: ${department.DeptName}. Admin notification email not sent.`);
    }

    // Send emails in parallel
    const emailResults = await sendMultipleEmails(emailsToSend);
    console.log(`Email sending completed: ${emailResults.successful} successful, ${emailResults.failed} failed`);

    res.status(201).json({ message: "Bookings created", bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
BookingRouter.get("/departments/name/:name/available-halls", async (req, res) => {
  try {
    const { date } = req.query; // Expected format: YYYY-MM-DD
    const name = req.params.name;

    // Find department
    const department = await Dept.findOne({ DeptName: name });
    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }
    console.log(name);
    // Find bookings from the given date to the future for the department
    const bookings = await Booking.find({
      Department:department._id.toString(), // or department._id if your Booking model uses that
      bookingDate: { $gte: new Date(date) }
    })
    // .populate("hall", "hallName")
    // .populate("email", "name email") // user details
    .sort({ bookingDate: 1, startTime: 1 }); // Sort by date and time
    console.log(bookings)
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
});




BookingRouter.get("/getpendings",protect, async (req, res) => {
  try {
    console.log("This is the pending Route")
    console.log(req.user);
    const dept = await Dept.findOne({ DeptName: req.user.DeptName });
    console.log(dept);  
const pendingList = await Booking.find({
  status: "pending",
  Department: dept._id.toString()
});
    console.log(pendingList); 
    if (pendingList) {
      return res.status(200).json({ pendingList })
    }
    res.status(201).json({ message: "No Pending Lists" })
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

BookingRouter.patch("/bookings/:id/status", protect, async (req, res) => {
  try {
    console.log(req.params.id);
    console.log(req.body);
    console.log(req.user);
    const booking = await Booking.findById(req.params.id);
    const email = await UserModel.findById(booking.email);
    console.log(booking)
    if (!booking) {
      return res.status(400).json({ message: "Booking not found" })
    }
    const hall = await Hall.findById(booking.hall);

    console.log(hall);

    if (!hall || !hall.isActive) {
      //  failure email
      await sendBookingMail({
        to: email.email,
        subject: `Hall Booking Failed - ${req.body.hallName}`,
        text: `Sorry, the hall "${req.body.hallName}" is not available or inactive. Please try another.`
      });

      return res.status(400).json({ error: "Hall not found or inactive." });
    }


    booking.status = req.body.status;
    console.log(req.body.reason);
    const save = await booking.save();
    // await sendBookingMail({
    //   to: email.email,
    //   subject: `Hall Booking Confirmation - ${hall.hallName}`,
    //   text: `Your booking for hall "${hall.hallName}" on ${booking.bookingDate} from ${booking.startTime} to ${booking.endTime} is ${req.body.status}.`
    // });
    await sendBookingMail({
  to: email.email,
  subject: `Hall Booking Confirmation - ${hall.hallName}`,
  text: `Your booking for hall "${hall.hallName}" on ${booking.bookingDate} from ${booking.startTime} to ${booking.endTime} is ${req.body.status}.`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333;">📅 Hall Booking Confirmation</h2>
      <p><strong>📍 Hall:</strong> ${hall.hallName}</p>
      <p><strong>📅 Date:</strong> ${booking.bookingDate}</p>
      <p><strong>⏰ Time:</strong> ${booking.startTime} to ${booking.endTime}</p>
      <p><strong>📌 Status:</strong> <span style="color: ${
        req.body.status === "Approved" ? "green" : req.body.status === "Rejected" ? "red" : "orange"
      };">${req.body.status}</span></p>
      <hr style="margin: 20px 0;" />
      <p>Thank you for using the Hall Booking System.</p>
      <p style="font-size: 12px; color: #888;">This is an automated message. Please do not reply.</p>
    </div>
  `
});

    if (booking.status == "rejected") {
      const deletebooking = await Booking.findByIdAndDelete(booking._id);
      console.log("Deleted Successfully" + deletebooking);
      await sendBookingMail({
  to: email.email,
  subject: `Hall Booking Failed - ${hall.hallName}`,
  text: `Sorry, your booking for the hall "${hall.hallName}" was not approved due to the following reason: ${req.body.reason}.`,
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #d32f2f;">Hall Booking Rejected</h2>
      <p>Hello,</p>
      <p>We're sorry to inform you that your booking for the hall <strong>"${hall.hallName}"</strong> was <strong>not approved</strong>.</p>
      <p><strong>Reason:</strong> ${req.body.reason}</p>
      <br/>
      <p>If you have any questions or need further assistance, please contact the admin team.</p>
      <p>Regards,<br/>Hall Booking System</p>
    </div>
  `
});

    }

    res.status(200).json({ message: "Status Uploaded successfully", booking })
  } catch (error) {
    res.status(500).json({ message: error })
  }
});

BookingRouter.post("/addHall", async (req, res) => {
  try {
    const { hallName, capacity, department } = req.body;
    console.log(req.body);
    const dept = await Dept.findOne({ DeptName: department });
    console.log(dept);
    const existHall = await Hall.findOne({ hallName });
    if (dept) {
      if (!existHall) {
        const newHall = await Hall.create({
          hallName,
          capacity,
          department: dept._id
        })
        if (newHall) {
          console.log(newHall);
          res.status(201).json({ message: "New Hall is Added" });
        }
      } else {
        res.status(400).json({ message: "Hall is already created" })
      }
    } else {
      res.status(400).json({ message: "Department is Not there" });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
})


BookingRouter.post("/addDept", async (req, res) => {
  try {
    const { DeptName } = req.body;
    console.log(DeptName)
    const existDept = await Dept.findOne({ DeptName });
    if (existDept) {
      return res.status(400).json({ message: "DEpartment already created" });
    }
    const newDept = await Dept.create({
      DeptName
    })
    if (newDept) {
      res.status(201).json({ message: "Department is created", newDept });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

BookingRouter.get("/getallbookings", async (req, res) => {
  try {
    const date = new Date();
    console.log(date);
    const todaybookings = await Booking.find({ date });
    console.log(todaybookings)
    res.status(200).json({ todaybookings });
  } catch (error) {
    res.status(500).json({ error })
  }
})

BookingRouter.post("/getallbookings", protect,async (req, res) => {
  try {
    const { date } = req.body;
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day));
    const endOfDay = new Date(Date.UTC(year, month - 1, day + 1));
    const dept = await Dept.findOne({ DeptName: req.user.DeptName });
    const bookings = await Booking.find({
      bookingDate: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      // Department:dept._id.toString(),
    });
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

BookingRouter.get("/fetchDepts", async (req, res) => {
  try {
    const fetchDepts = await Dept.find();
    res.status(200).json({ fetchDepts })
  } catch (error) {
    res.status(500).json({ message: error })
  }
})
BookingRouter.get("/fetchHalls", async (req, res) => {
  try {
    const fetchHalls = await Hall.find();
    res.status(200).json({ fetchHalls });
  } catch (error) {
    res.status(500).json({ message: error })
  }
})


function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

BookingRouter.get('/bookings/fully-occupied', async (req, res) => {
  try {
    const bookings = await Booking.find({
      startTime: { $gte: '09:00' },
      endTime: { $lte: '16:00' }
    });

    const deptMap = {}; // deptId => deptName
    const dateOccupancy = {}; // deptName => { date => totalMinutes }

    for (const booking of bookings) {
      const deptId = booking.Department;

      // Cache the department name to avoid multiple DB calls
      if (!deptMap[deptId]) {
        const deptDoc = await Dept.findById(deptId).lean();
        if (!deptDoc) continue;
        deptMap[deptId] = deptDoc.DeptName;
      }

      const deptName = deptMap[deptId];
      const date = new Date(booking.bookingDate).toISOString().split('T')[0];

      const start = timeToMinutes(booking.startTime);
      const end = timeToMinutes(booking.endTime);
      const duration = end - start;

      if (!dateOccupancy[deptName]) {
        dateOccupancy[deptName] = {};
      }

      if (!dateOccupancy[deptName][date]) {
        dateOccupancy[deptName][date] = 0;
      }

      dateOccupancy[deptName][date] += duration;
    }

    // Filter only fully occupied dates per department
    const result = {};
    for (const deptName in dateOccupancy) {
      const dates = Object.keys(dateOccupancy[deptName]).filter(
        (date) => dateOccupancy[deptName][date] >= 420
      );

      if (dates.length > 0) {
        result[deptName] = dates;
      }
    }
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching fully occupied dates' });
  }
});

// Test email endpoint for debugging Resend configuration
BookingRouter.get("/test-email", async (req, res) => {
  try {
    console.log("=== TEST EMAIL ENDPOINT CALLED ===");
    console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "SET (hidden)" : "NOT SET");
    console.log("BREVO_SMTP_KEY:", process.env.BREVO_SMTP_KEY ? "SET (hidden)" : "NOT SET");
    console.log("BREVO_EMAIL:", process.env.BREVO_EMAIL || "NOT SET");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "NOT SET - will use default");
    console.log("GMAIL_USER:", process.env.GMAIL_USER || "NOT SET");
    
    const testEmail = req.query.email || "akashbalu2001@gmail.com";
    console.log(`Sending test email to: ${testEmail}`);
    
    const result = await sendBookingMail({
      to: testEmail,
      subject: "Test Email from Hall Booking System",
      text: "This is a test email from your Hall Booking System. If you receive this, your email service is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50;">✅ Email Test Successful!</h1>
            <p>This is a test email from your Hall Booking System.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <p><strong>Server:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>Email Service:</strong> ${process.env.BREVO_SMTP_KEY ? 'Brevo' : (process.env.RESEND_API_KEY ? 'Resend' : 'Gmail (fallback)')}</p>
            <p><strong>From Email:</strong> ${process.env.EMAIL_FROM || (process.env.BREVO_EMAIL || 'onboarding@resend.dev')}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="color: green; font-weight: bold;">✅ If you received this email, your email service is configured correctly!</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              You can now update these environment variables in Render for production.
            </p>
          </div>
        </div>
      `
    });
    
    console.log("Test email result:", result);
    
    res.status(200).json({ 
      message: "Test email sent successfully", 
      result,
      configuration: {
        emailService: process.env.BREVO_SMTP_KEY ? 'Brevo' : (process.env.RESEND_API_KEY ? 'Resend' : 'Gmail (fallback)'),
        fromEmail: process.env.EMAIL_FROM || (process.env.BREVO_EMAIL || process.env.RESEND_API_KEY ? 'onboarding@resend.dev' : process.env.GMAIL_USER || 'not set'),
        resendApiKeySet: !!process.env.RESEND_API_KEY,
        brevoSmtpKeySet: !!process.env.BREVO_SMTP_KEY,
        brevoEmailSet: !!process.env.BREVO_EMAIL,
        emailFromSet: !!process.env.EMAIL_FROM,
        nodeEnv: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      configuration: {
        emailService: process.env.BREVO_SMTP_KEY ? 'Brevo' : (process.env.RESEND_API_KEY ? 'Resend' : 'Gmail (fallback)'),
        resendApiKeySet: !!process.env.RESEND_API_KEY,
        brevoSmtpKeySet: !!process.env.BREVO_SMTP_KEY,
        brevoEmailSet: !!process.env.BREVO_EMAIL,
        emailFromSet: !!process.env.EMAIL_FROM,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      troubleshooting: {
        message: "Check your .env file in hallbackend folder",
        requiredVars: [
          "RESEND_API_KEY=re_your_api_key_here",
          "EMAIL_FROM=onboarding@resend.dev"
        ]
      }
    });
  }
});

module.exports = BookingRouter;