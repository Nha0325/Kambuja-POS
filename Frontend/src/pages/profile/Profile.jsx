import useCurrent from "../../hooks/auth/useCurrent";
import { adminSurface } from "../admin/adminPageUi";

function Profile() {
  const { data: user, isLoading } = useCurrent();

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className={adminSurface.page}>
      <div className={adminSurface.header}>
        <div>
          <p className={adminSurface.eyebrow}>Account</p>
          <h1 className={adminSurface.title}>Profile Settings</h1>
          <p className={adminSurface.description}>
            Manage your personal information and preferences.
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className={adminSurface.card}>
          <div className="mb-6 border-b border-[#e5eeff] pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0b1c30] text-3xl font-bold text-white uppercase">
                {user?.username?.[0] || user?.email?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#0b1c30] capitalize">{user?.username || "User"}</h2>
                <p className="text-[#45464d]">{user?.email}</p>
                <span className="mt-2 inline-block rounded-full bg-[#eff4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0058be]">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Username</label>
              <input
                disabled
                defaultValue={user?.username}
                className={`${adminSurface.input} w-full bg-[#f8f9ff] text-[#76777d]`}
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Email</label>
              <input
                disabled
                defaultValue={user?.email}
                className={`${adminSurface.input} w-full bg-[#f8f9ff] text-[#76777d]`}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#45464d]">Role</label>
              <input
                disabled
                defaultValue={user?.role}
                className={`${adminSurface.input} w-full bg-[#f8f9ff] text-[#76777d] capitalize`}
              />
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
