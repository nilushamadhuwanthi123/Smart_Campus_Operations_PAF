export const appRoutes = Object.freeze({
  dashboard: '/dashboard',
  tickets: '/tickets',
  newTicket: '/tickets/new',
  ticketDetail: (ticketId) => `/tickets/${ticketId}`,
  notifications: '/notifications',
  settings: '/settings'
});
