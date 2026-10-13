import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, immutable: true },
    actorId: { type: String, default: null },
    actorName: { type: String, default: null },
    actorRole: { type: String, default: null },
    method: { type: String, immutable: true },
    path: { type: String, immutable: true },
    resource: { type: String, default: null },
    status: { type: Number, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  { timestamps: false, versionKey: false }
);

// Append-only ledger: block every mutation path on this collection.
const blockMutation = function () {
  throw new Error('Audit logs are immutable and cannot be modified or deleted.');
};
AuditLogSchema.pre('findOneAndUpdate', blockMutation);
AuditLogSchema.pre('updateOne', blockMutation);
AuditLogSchema.pre('updateMany', blockMutation);
AuditLogSchema.pre('deleteOne', blockMutation);
AuditLogSchema.pre('deleteMany', blockMutation);
AuditLogSchema.pre('findOneAndDelete', blockMutation);

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
