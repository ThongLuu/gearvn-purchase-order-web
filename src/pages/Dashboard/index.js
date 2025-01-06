import React from "react";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard 1</h1>
      <iframe
        width="100%"
        height="600"
        seamless
        frameBorder="0"
        scrolling="no"
        src="https://superset.gearvn.xyz/superset/explore/p/BdbjVb9wjMr/?standalone=1&height=400"
      ></iframe>
      <h1>Dashboard 2</h1>
      <iframe
        width="100%"
        height="600"
        seamless
        frameBorder="0"
        scrolling="no"
        src="https://superset.gearvn.xyz/superset/explore/p/LBe6kxDDZNq/?standalone=1&height=400"
      ></iframe>
    </div>
  );
};

export default Dashboard;
