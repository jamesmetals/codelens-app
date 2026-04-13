export function getAvatarUrl(authUser) {
  return String(
    authUser?.user_metadata?.avatar_url
      || authUser?.user_metadata?.picture
      || authUser?.user_metadata?.photo_url
      || "",
  ).trim();
}

export function getAvatarFallback(authUser) {
  const source = String(
    authUser?.user_metadata?.full_name
      || authUser?.user_metadata?.name
      || authUser?.email
      || "C",
  ).trim();

  return source.charAt(0).toUpperCase() || "C";
}
