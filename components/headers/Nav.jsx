
"use client";
import { getLocalizedUrl } from "@/utils/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Nav({ isArrow = true, textColor = "", Linkfs = "", menuItems: initialMenuItems = [], lang = "tr" }) {
  const pathname = usePathname();
  const menuItems = initialMenuItems;

  const isMenuActive = (menuItem) => {
    const url = menuItem.url || "";
    if (!url || url === "#") return false;

    let pathToCheck = url;
    try {
      if (url.startsWith("http")) {
        pathToCheck = new URL(url).pathname;
      }
    } catch (e) {
      pathToCheck = url;
    }

    // pathToCheck zaten Header içinde yerelleştirildiği için pathname ile doğrudan kıyaslanabilir
    const isHome = pathToCheck === "/" || pathToCheck === "" || pathToCheck === `/${lang}/` || pathToCheck === `/${lang}`;

    // Eğer anasayfa ise
    if (isHome) {
      return pathname === "/" || pathname === `/${lang}` || pathname === `/${lang}/`;
    }

    const isActive = pathToCheck !== "/" && pathname.startsWith(pathToCheck);
    if (isActive) return true;

    if (menuItem.children && menuItem.children.length) {
      return menuItem.children.some((child) => isMenuActive(child));
    }

    return false;
  };

  return (
    <>
      {menuItems.map((item, index) => (
        <li key={`${index}-${pathname}`} className="menu-item position-relative">
          <Link
            href={item.url || "#"}
            target={item.target || "_self"}
            className={`item-link ${Linkfs} ${textColor} ${isMenuActive(item) ? "activeMenu" : ""} ${item.css_class || ""
              }`}
          >
            {item.title}
            {item.children?.length > 0 && isArrow && <i className="icon icon-arrow-down" />}
          </Link>

          {item.children?.length > 0 && (
            <div
              className="sub-menu submenu-default"
            >
              <ul className="menu-list">
                {item.children.map((subItem, subIndex) => (
                  <li key={subIndex} className={subItem.children?.length > 0 ? "menu-item-2" : ""}>
                    <Link
                      href={subItem.url || "#"}
                      target={subItem.target || "_self"}
                      className={`menu-link-text link ${isMenuActive(subItem) ? "activeMenu" : ""} ${subItem.css_class || ""
                        }`}
                    >
                      {subItem.title}
                    </Link>
                    {subItem.children?.length > 0 && (
                      <div
                        className="sub-menu submenu-default"
                      >
                        <ul className="menu-list">
                          {subItem.children.map((subItem2, subIndex2) => (
                            <li key={subIndex2}>
                              <Link
                                href={subItem2.url || "#"}
                                target={subItem2.target || "_self"}
                                className={`menu-link-text link ${isMenuActive(subItem2) ? "activeMenu" : ""} ${subItem2.css_class || ""
                                  }`}
                              >
                                {subItem2.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </>
  );
}
