import { permissions } from './config.json' with { type: 'json' }
const permissionsList: PermissionsList = permissions; 

export type PermissionBitMask = typeof permissions[keyof typeof permissions]
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