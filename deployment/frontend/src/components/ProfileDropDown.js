import React from "react";
import { Button, Dropdown } from "antd";

const ProfileDropDown = ({ name, items }) => {
  return (
    <div>
      <Dropdown
        menu={{
          items,
        }}
        placement="bottomLeft"
      >
        <button>{name}</button>
      </Dropdown>
    </div>
  );
};

export default ProfileDropDown;
