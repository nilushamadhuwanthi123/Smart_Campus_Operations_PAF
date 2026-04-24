export const appRoutes = Object.freeze({
  login: '/login',
  dashboard: '/dashboard',
  resources: '/resources',
  tickets: '/tickets',
  newTicket: '/tickets/new',
  ticketDetail: (ticketId) => `/tickets/${ticketId}`,
  adminUsers: '/admin/users',
  notifications: '/notifications',
  settings: '/settings'
});
