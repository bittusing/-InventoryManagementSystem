export const checkPermission = (module, action) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  // Check specific permission
  if (user.permissions && user.permissions[module]) {
    return user.permissions[module][action] === true;
  }
  
  return false;
};

export const hasAnyPermission = (module) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'super_admin') return true;
  
  if (user.permissions && user.permissions[module]) {
    return Object.values(user.permissions[module]).some(val => val === true);
  }
  
  return false;
};
