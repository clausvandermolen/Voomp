export const getUserFullName = (u) => {
  if (!u) return "Usuario";
  if (u.firstName && u.lastNameP) return `${u.firstName} ${u.lastNameP} ${u.lastNameM || ""}`.trim();
  if (u.name) return u.name;
  return u.firstName || "Usuario";
};

export const makeChatKey = (userId1, userId2) => {
  const ids = [String(userId1), String(userId2)].sort();
  return `chat_${ids[0]}_${ids[1]}`;
};
