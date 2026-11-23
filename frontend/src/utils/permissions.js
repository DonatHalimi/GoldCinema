export function normalizePermissions(permissionData) {
    if (Array.isArray(permissionData)) return permissionData;
    if (Array.isArray(permissionData?.permissions)) return permissionData.permissions;
    return [];
}

export function hasPermission(permissionData, permission) {
    const permissions = normalizePermissions(permissionData);
    return permissions.includes('*') || permissions.includes(permission);
}

export function hasAnyPermission(permissionData, permissions) {
    return permissions.some((permission) => hasPermission(permissionData, permission));
}

export function hasAllPermissions(permissionData, permissions) {
    return permissions.every((permission) => hasPermission(permissionData, permission));
}
