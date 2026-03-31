
export const C = {
  gold:       "#c9a84c",
  goldLight:  "#e8c96e",
  goldDark:   "#b8953e",
  bg:         "#080502",
  surface:    "#0f0c08",
  surface2:   "#110e08",
  white:      "#ffffff",
  text:       "rgba(255,255,255,0.75)",
  textDim:    "rgba(255,255,255,0.35)",
  textFaint:  "rgba(255,255,255,0.12)",
  border:     "rgba(201,168,76,0.2)",
  borderDim:  "rgba(255,255,255,0.08)",
};

export const NAV_ITEMS = [
  { label: "NEW IN", path: "/shop?tag=NEW", items: [
    { label: "New Arrivals",   path: "/shop?tag=NEW" },
    { label: "Trending Now",   path: "/shop?sort=trending" },
    { label: "Back in Stock",  path: "/shop?filter=restock" },
    { label: "Editor's Picks", path: "/shop?filter=editors" },
    { label: "Gift Cards",     path: "/gift-cards" },
  ]},
  { label: "WOMEN", path: "/shop?category=Women", items: [
    { label: "Dresses",        path: "/shop?category=Women&sub=Dresses" },
    { label: "Tops & Blouses", path: "/shop?category=Women&sub=Tops" },
    { label: "Trousers",       path: "/shop?category=Women&sub=Trousers" },
    { label: "Outerwear",      path: "/shop?category=Women&sub=Outerwear" },
    { label: "Knitwear",       path: "/shop?category=Women&sub=Knitwear" },
    { label: "Shoes",          path: "/shop?category=Women&sub=Shoes" },
  ]},
  { label: "MEN", path: "/shop?category=Men", items: [
    { label: "Shirts",         path: "/shop?category=Men&sub=Shirts" },
    { label: "Trousers",       path: "/shop?category=Men&sub=Trousers" },
    { label: "Suits",          path: "/shop?category=Men&sub=Suits" },
    { label: "Outerwear",      path: "/shop?category=Men&sub=Outerwear" },
    { label: "Knitwear",       path: "/shop?category=Men&sub=Knitwear" },
    { label: "Shoes",          path: "/shop?category=Men&sub=Shoes" },
  ]},
  { label: "ACCESSORIES", path: "/shop?category=Accessories", items: [
    { label: "Bags",           path: "/shop?category=Accessories&sub=Bags" },
    { label: "Silk Scarves",   path: "/shop?category=Accessories&sub=Scarves" },
    { label: "Belts",          path: "/shop?category=Accessories&sub=Belts" },
    { label: "Fine Jewellery", path: "/shop?category=Accessories&sub=Jewellery" },
    { label: "Sunglasses",     path: "/shop?category=Accessories&sub=Sunglasses" },
    { label: "Hats",           path: "/shop?category=Accessories&sub=Hats" },
  ]},
  { label: "SALE", path: "/shop?tag=SALE", items: [
    { label: "Women's Sale",     path: "/shop?category=Women&tag=SALE" },
    { label: "Men's Sale",       path: "/shop?category=Men&tag=SALE" },
    { label: "Accessories Sale", path: "/shop?category=Accessories&tag=SALE" },
    { label: "Up to 70% Off",    path: "/shop?tag=SALE" },
  ]},
];

import {
  MagnifyingGlassIcon, UserIcon as HeroUserIcon, ShoppingBagIcon,
  ChevronDownIcon, ArrowRightIcon, EyeIcon as HeroEyeIcon,
  EyeSlashIcon as HeroEyeSlashIcon, ArrowTopRightOnSquareIcon,
  PlayIcon as HeroPlayIcon, XMarkIcon, EnvelopeIcon, LockClosedIcon,
  HomeIcon, ShoppingCartIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon,
  TagIcon, ClipboardDocumentListIcon, ArrowRightOnRectangleIcon,
  BellIcon, CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const SearchIcon   = () => <MagnifyingGlassIcon className="w-5 h-5" />;
export const UserIcon     = () => <HeroUserIcon className="w-5 h-5" />;
export const BagIcon      = () => <ShoppingBagIcon className="w-5 h-5" />;
export const ChevDown     = () => <ChevronDownIcon className="w-5 h-5" />;
export const ArrowRight   = () => <ArrowRightIcon className="w-5 h-5" />;
export const EyeIcon      = ({ off }) => off ? <HeroEyeSlashIcon className="w-5 h-5" /> : <HeroEyeIcon className="w-5 h-5" />;
export const ArrowUpRight = () => <ArrowTopRightOnSquareIcon className="w-5 h-5" />;
export const PlayIcon     = () => <HeroPlayIcon className="w-5 h-5" />;
export const XIcon        = () => <XMarkIcon className="w-5 h-5" />;
export const MailIcon     = () => <EnvelopeIcon className="w-5 h-5" />;
export const LockIcon     = () => <LockClosedIcon className="w-5 h-5" />;
export const HomeIconEl   = () => <HomeIcon className="w-5 h-5" />;
export const CartIcon     = () => <ShoppingCartIcon className="w-5 h-5" />;
export const UsersIconEl  = () => <UsersIcon className="w-5 h-5" />;
export const ChartIcon    = () => <ChartBarIcon className="w-5 h-5" />;
export const SettingsIcon = () => <Cog6ToothIcon className="w-5 h-5" />;
export const TagIconEl    = () => <TagIcon className="w-5 h-5" />;
export const OrdersIcon   = () => <ClipboardDocumentListIcon className="w-5 h-5" />;
export const LogoutIcon   = () => <ArrowRightOnRectangleIcon className="w-5 h-5" />;
export const BellIconEl   = () => <BellIcon className="w-5 h-5" />;
export const CheckIcon    = () => <CheckCircleIcon className="w-5 h-5" />;

export const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Cormorant+Garamond:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #080502; color: rgba(255,255,255,0.75); font-family: 'Cormorant Garamond', Georgia, serif; }
    input, button { font-family: 'Cormorant Garamond', Georgia, serif; }
    a { text-decoration: none; color: inherit; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #080502; }
    ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 2px; }

    @keyframes slideDown  { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fadeUp     { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin       { to { transform: rotate(360deg); } }
    @keyframes shimmer    { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes pulse      { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes scaleIn    { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .spin { animation: spin 0.75s linear infinite; }
    .fade-up { animation: fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards; }
    .gold-text { background: linear-gradient(90deg,#c9a84c,#e8c96e,#c9a84c); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3s ease infinite; }

    .m-reveal, .m-reveal-left, .m-reveal-right { opacity: 0; transform: translateY(55px); transition: all 0.95s cubic-bezier(0.23,1,0.32,1); }
    .m-reveal.visible, .m-reveal-left.visible, .m-reveal-right.visible { opacity:1; transform:translateY(0); }
    .m-reveal-left { transform:translateX(-70px); }
    .m-reveal-right { transform:translateX(70px); }

    .m-btn-gold { background:#c9a84c; color:#0f0c08; border:none; padding:15px 42px; font-size:10px; letter-spacing:0.22em; font-weight:500; cursor:pointer; transition:all .3s cubic-bezier(0.4,0,0.2,1); text-transform:uppercase; }
    .m-btn-gold:hover { background:#e8c96e; transform:translateY(-2px); box-shadow:0 10px 25px rgba(201,168,76,.3); }
    .m-btn-outline-white { border:1px solid rgba(255,255,255,.75); color:#fff; background:transparent; padding:14px 36px; font-size:10px; letter-spacing:0.22em; cursor:pointer; transition:all .3s ease; }
    .m-btn-outline-white:hover { background:rgba(255,255,255,.08); border-color:#fff; }
    .m-btn-outline-light { border:1px solid rgba(201,168,76,.6); color:#c9a84c; background:transparent; padding:14px 36px; font-size:10px; letter-spacing:0.22em; cursor:pointer; transition:all .3s ease; }
    .m-btn-outline-light:hover { background:rgba(201,168,76,.08); border-color:#c9a84c; }

    .m-feat-item:hover .m-feat-icon { background:rgba(201,168,76,.12); border-color:#c9a84c; }
    .m-col-card:hover .m-col-arrow { background:#c9a84c; color:#0f0c08; border-color:#c9a84c; }
    .m-col-card:hover .m-col-bg { transform:scale(1.04); }
    .m-prod-card:hover .m-prod-bg { transform:scale(1.06); }
    .m-prod-card:hover .m-quick-add { opacity:1; transform:translateY(0); }
    .m-quick-add { opacity:0; transform:translateY(20px); transition:all .3s ease; }
    .m-wishlist:hover { background:#c9a84c !important; color:#fff !important; }
    .m-shimmer-text { background:linear-gradient(90deg,#c9a84c,#e8c96e,#c9a84c); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shimmer 3.5s ease infinite; }
    .m-newsletter-input { flex:1; padding:16px 22px; background:rgba(255,255,255,.06); border:1px solid rgba(201,168,76,.3); color:#fff; font-size:10.5px; letter-spacing:0.08em; outline:none; }
    .m-newsletter-input:focus { border-color:#c9a84c; }
    .m-newsletter-btn { padding:16px 32px; background:#c9a84c; color:#0f0c08; border:none; display:flex; align-items:center; gap:10px; font-size:9.8px; letter-spacing:0.2em; cursor:pointer; transition:all .3s ease; }
    .m-newsletter-btn:hover { background:#e8c96e; }
    .m-footer-link { display:block; color:#6b5c44; font-size:13.5px; margin-bottom:11px; text-decoration:none; transition:color .2s; }
    .m-footer-link:hover { color:#c9a84c; }
    .m-pay-badge { padding:5px 12px; border:1px solid rgba(201,168,76,.25); color:#6b5c44; font-size:9.5px; border-radius:4px; }
  `}</style>
);

export const GoldBar = ({ width = "48px", centered = false }) => (
  <div style={{ width, height: "1px", margin: centered ? "0 auto 20px" : "0 0 20px", background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />
);
export const Spinner = () => (
  <svg className="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.2" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);
