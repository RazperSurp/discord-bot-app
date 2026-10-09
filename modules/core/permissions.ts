import { Core } from './core';

class PermissionSet {
    mask;

    constructor(mask = 0) {
        this.mask = mask;
    }

    has(permission: Core.Permission): boolean {
        return (this.mask & permission) === permission;
    }

    add(...permissions: Core.Permission[]): PermissionSet {
        let mask = this.mask;
        for (const p of permissions) mask |= p;
        return new PermissionSet(mask);
    }
    
    remove(...permissions: Core.Permission[]): PermissionSet {
        let mask = this.mask;
        for (const p of permissions) mask &= ~p;
        return new PermissionSet(mask);
    }
}

Core.PermissionSet = PermissionSet;