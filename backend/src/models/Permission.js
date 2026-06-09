const mongoose = require('mongoose')

const permissionSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

permissionSchema.index({ action: 1, resource: 1 }, { unique: true })

const Permission = mongoose.model('Permission', permissionSchema)

// ------------------------------------

const rolePermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['admin', 'instructor', 'learner', 'guest'],
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
  },
  { timestamps: true }
)

rolePermissionSchema.index({ role: 1, permissionId: 1 }, { unique: true })

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema)

module.exports = { Permission, RolePermission }
