import config from './config.json' with { type: 'json' }
const permissionsList: PermissionsList = config.permissions; 

export type PermissionBitMask = typeof config.permissions[keyof typeof config.permissions]
export interface PermissionsList { [index: string]: PermissionBitMask }

export class PermissionSet {
    mask: PermissionBitMask;

    constructor(mask: PermissionBitMask) {
        this.mask = mask;
    }

    has(permission: PermissionBitMask): boolean {
        return (this.mask & permission) === permission;
    }

    add(...permissions: PermissionBitMask[]): PermissionSet {
        let next = this.mask;
        for (const p of permissions) next |= p;
        return new PermissionSet(next);
    }
}