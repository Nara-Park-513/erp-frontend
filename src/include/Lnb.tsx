
import { NavLink } from "react-router-dom";

type SubMenu = { key: string; label: string; path: string };

type Props = {
  menuList: SubMenu[];
  title?: string;
};

const  Lnb = ({ menuList, title = "재고 메뉴" }: Props) => {
  return (
    <div style={{ width: 180, borderRight: "1px solid #ccc", padding: 10, marginTop:"120px" }}>
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>{title}</div>
      {menuList.map((menu) => (
        <NavLink
          key={menu.key}
          to={menu.path}
          style={({ isActive }) => ({
            display: "block",
            padding: "6px 10px",
            marginBottom: 4,
            textDecoration: "none",
            color: isActive ? "hotpink" : "black",
            backgroundColor: isActive ? "#ffe4e1" : "transparent",
            borderRadius: 4,
            fontSize: 14,
          })}
        >
          {menu.label}
        </NavLink>
      ))}
    </div>
  );
};

export default Lnb;