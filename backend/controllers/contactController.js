import Contact from "../models/contactModel.js";
import { Parser } from "json2csv"; // For CSV export

// ------------------------- CREATE -------------------------
export const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      createdBy: req.user._id,
    };

    // Clean empty fields
    if (contactData.referral?.referrer === "") {
      contactData.referral.referrer = undefined;
    }
    if (contactData.referral?.referralDate === "") {
      contactData.referral.referralDate = undefined;
    }
    if (contactData.anniversary === "") {
      contactData.anniversary = undefined;
    }

    const contact = new Contact(contactData);
    await contact.save();

    const populatedContact = await Contact.findById(contact._id).populate(
      "referral.referrer",
      "fullName email"
    );

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: populatedContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error creating contact",
      error: error.message,
    });
  }
};

// ------------------------- GET ALL -------------------------
export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      leadType,
      source,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { province: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (leadType) filter.leadType = leadType;
    if (source) filter.source = source;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Query with pagination
    const skip = (page - 1) * limit;
    const contacts = await Contact.find(filter)
      .populate("referral.referrer", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: error.message,
    });
  }
};

// ------------------------- GET ONE -------------------------
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("referral.referrer", "fullName email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
      error: error.message,
    });
  }
};

// ------------------------- UPDATE -------------------------
export const updateContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    if (contactData.referral?.referrer === "") {
      contactData.referral.referrer = undefined;
    }
    if (contactData.referral?.referralDate === "") {
      contactData.referral.referralDate = undefined;
    }
    if (contactData.anniversary === "") {
      contactData.anniversary = undefined;
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      contactData,
      { new: true, runValidators: true }
    ).populate("referral.referrer", "fullName email");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({
      success: false,
      message: "Error updating contact",
      error: error.message,
    });
  }
};

// ------------------------- DELETE -------------------------
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user._id },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
      error: error.message,
    });
  }
};

// ------------------------- UPDATE STATUS -------------------------
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await contact.updateStatus(status, req.user._id);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};

// ------------------------- GET BY STATUS -------------------------
export const getContactsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const contacts = await Contact.getContactsByStatus(status);
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching contacts by status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts by status",
      error: error.message,
    });
  }
};

// ------------------------- GET REFERRALS -------------------------
export const getReferralContacts = async (req, res) => {
  try {
    const contacts = await Contact.getReferralContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error fetching referral contacts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching referral contacts",
      error: error.message,
    });
  }
};

// ------------------------- IMPORT -------------------------
export const importContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: "Contacts data is required and must be an array",
      });
    }

    const importedContacts = [];
    const errors = [];

    for (const contactData of contacts) {
      try {
        const cleaned = { ...contactData, createdBy: req.user._id };

        if (cleaned.referral?.referrer === "") cleaned.referral.referrer = undefined;
        if (cleaned.referral?.referralDate === "") cleaned.referral.referralDate = undefined;
        if (cleaned.anniversary === "") cleaned.anniversary = undefined;

        const contact = new Contact(cleaned);
        await contact.save();
        importedContacts.push(contact);
      } catch (err) {
        errors.push({ data: contactData, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedContacts.length} contacts`,
      data: {
        imported: importedContacts.length,
        errors: errors.length,
        errorDetails: errors,
      },
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    res.status(500).json({
      success: false,
      message: "Error importing contacts",
      error: error.message,
    });
  }
};

// ------------------------- EXPORT -------------------------
export const exportContacts = async (req, res) => {
  try {
    const { format = "json", search, status, source, leadType } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { province: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (leadType) filter.leadType = leadType;

    const contacts = await Contact.find(filter).populate(
      "referral.referrer",
      "fullName email"
    );

    if (format === "csv") {
      const fields = [
        "fullName",
        "email",
        "phoneNumber",
        "streetAddress",
        "city",
        "province",
        "country",
        "dateOfBirth",
        "status",
        "anniversary",
        "leadType",
        "source",
        "lastInteractionDate",
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(contacts);

      res.header("Content-Type", "text/csv");
      res.attachment("contacts.csv");
      return res.send(csv);
    }

    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error("Error exporting contacts:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting contacts",
      error: error.message,
    });
  }
};
