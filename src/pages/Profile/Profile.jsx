import { useSelector } from "react-redux";
import Container from "../../components/Container/Container";
import { authService } from "../../roundtable";
import Button from "../../components/Button/Button";
import { Link } from "react-router";
import Avatar from "../../components/Avatar";

function ProfilePage() {
  const user = useSelector((state) => state.auth.user);

  const stats = [
    { label: "Communities", value: user.communitiesCount },
    { label: "Posts", value: user.postsCount },
  ];

  return (
    <Container className="space-y-10">
      {/* Profile Header */}
      <div className="relative bg-surface border border-border rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* ProfileImage */}
          <div className="relative">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              profileImage={user.profileImage}
              size="xlg"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-semibold tracking-tight">
                  {user.firstName} {user.lastName}
                </h1>
              </div>

              {/* Actions */}
              <div className="flex justify-center lg:justify-end gap-3">
                <Link to="/profile/edit">
                  <Button>Edit Profile</Button>
                </Link>
                <Button
                  onClick={() => {
                    authService.userLogout();
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>

            <p className="text-sm text-t-muted max-w-2xl text-center lg:text-left">
              {user.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-6 text-center hover:shadow-md transition"
          >
            <p className="text-3xl font-semibold tracking-tight">
              {stat.value}
            </p>
            <p className="text-sm text-t-secondary mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h1>Press here to see all Communities</h1>
      </div>

      <div>
        <h1>Posts</h1>
      </div>
    </Container>
  );
}

export default ProfilePage;
