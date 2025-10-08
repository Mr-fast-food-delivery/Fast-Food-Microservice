const ServiceAccount = require("../models/serviceAccount");
const {
  getDefaultScopesForService,
  validateServiceScopes,
} = require("../utils/serviceScopes");

// Create a new service account
exports.createServiceAccount = async (req, res) => {
  try {
    const { name, description, serviceName, scopes } = req.body;

    // Validate required fields
    if (!name || !serviceName) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and serviceName",
      });
    }

    // Check if service account with this name already exists
    const existingAccount = await ServiceAccount.findOne({ name });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Service account with this name already exists",
      });
    }

    // Use default scopes for the service or validate provided scopes
    let accountScopes = scopes;

    if (
      !accountScopes ||
      !Array.isArray(accountScopes) ||
      accountScopes.length === 0
    ) {
      // Use default scopes for the service
      accountScopes = getDefaultScopesForService(serviceName);
    } else {
      // Validate provided scopes
      const isValid = validateServiceScopes(serviceName, accountScopes);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid scopes provided",
        });
      }
    }

    // Create the service account
    const { serviceAccount, clientSecret } =
      await ServiceAccount.createServiceAccount({
        name,
        description,
        serviceName,
        scopes: accountScopes,
        createdBy: req.user ? req.user._id : null,
      });

    res.status(201).json({
      success: true,
      data: {
        serviceAccount,
        clientSecret,
        message: "Store the client secret securely, it will not be shown again",
      },
    });
  } catch (error) {
    console.error("Create service account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Get all service accounts
exports.getServiceAccounts = async (req, res) => {
  try {
    const serviceAccounts = await ServiceAccount.find()
      .select("-clientSecret")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: serviceAccounts.length,
      data: serviceAccounts,
    });
  } catch (error) {
    console.error("Get service accounts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single service account
exports.getServiceAccount = async (req, res) => {
  try {
    const serviceAccount = await ServiceAccount.findById(req.params.id).select(
      "-clientSecret"
    );

    if (!serviceAccount) {
      return res.status(404).json({
        success: false,
        message: "Service account not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serviceAccount,
    });
  } catch (error) {
    console.error("Get service account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a service account
exports.updateServiceAccount = async (req, res) => {
  try {
    const { name, description, scopes, active } = req.body;

    // Find the service account
    const serviceAccount = await ServiceAccount.findById(req.params.id);

    if (!serviceAccount) {
      return res.status(404).json({
        success: false,
        message: "Service account not found",
      });
    }

    // Update fields if provided
    if (name) serviceAccount.name = name;
    if (description !== undefined) serviceAccount.description = description;
    if (active !== undefined) serviceAccount.active = active;

    // Validate and update scopes if provided
    if (scopes && Array.isArray(scopes)) {
      const isValid = validateServiceScopes(serviceAccount.serviceName, scopes);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid scopes provided",
        });
      }
      serviceAccount.scopes = scopes;
    }

    // Save the updated service account
    serviceAccount.updatedAt = Date.now();
    await serviceAccount.save();

    res.status(200).json({
      success: true,
      data: serviceAccount,
    });
  } catch (error) {
    console.error("Update service account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Regenerate client secret for a service account
exports.regenerateSecret = async (req, res) => {
  try {
    // Find the service account with secret
    const serviceAccount = await ServiceAccount.findById(req.params.id).select(
      "+clientSecret"
    );

    if (!serviceAccount) {
      return res.status(404).json({
        success: false,
        message: "Service account not found",
      });
    }

    // Generate new secret
    const newSecret = await serviceAccount.generateNewSecret();

    res.status(200).json({
      success: true,
      data: {
        clientId: serviceAccount.clientId,
        clientSecret: newSecret,
        message:
          "Store the new client secret securely, it will not be shown again",
      },
    });
  } catch (error) {
    console.error("Regenerate secret error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a service account
exports.deleteServiceAccount = async (req, res) => {
  try {
    const serviceAccount = await ServiceAccount.findById(req.params.id);

    if (!serviceAccount) {
      return res.status(404).json({
        success: false,
        message: "Service account not found",
      });
    }

    await serviceAccount.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete service account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
