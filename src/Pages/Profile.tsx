const profileSections = [
  {
    title: "Account details",
    lines: ["Maya Chen", "maya.chen@example.com", "Customer account"],
  },
  {
    title: "Location",
    lines: ["Vancouver, BC", "Delivery notes: front door pickup shelf"],
  },
  {
    title: "Preferences",
    lines: ["Interested in berries, greens, tomatoes", "Show nearby market pickup options"],
  },
  {
    title: "Saved information",
    lines: ["1 saved address", "2 favorite farms", "Reusable basket preferred"],
  },
];

function Profile() {
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Profile</p>
        <h1>Your local food account.</h1>
        <p>
          A prototype account page for customer details, preferred location, and
          saved Hatti settings.
        </p>
      </section>

      <section className="content-section">
        <div className="row g-4">
          {profileSections.map((section) => (
            <div className="col-12 col-lg-6" key={section.title}>
              <article className="hatti-card profile-card h-100">
                <h3>{section.title}</h3>
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </article>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Profile;
