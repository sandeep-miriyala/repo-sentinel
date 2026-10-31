// Every icon in Repo Sentinel comes from yuktai (@yuktishaalaa/yuktai/icons).
// Without a label they are decorative and hidden from screen readers; the text next to them carries the meaning.
import {
  AlertIcon as YAlert,
  BarChartIcon,
  ChatIcon,
  CodeIcon,
  GlobeIcon,
  HubIcon,
  InstallIcon,
  LockIcon as YLock,
  ResetIcon,
  ShieldCheckIcon,
  SparkIcon as YSpark,
} from "@yuktishaalaa/yuktai/icons";

/** Brand mark: filled shield on yuktai green (white glyph, 5.5:1 contrast). */
export const BrandIcon = ({ size = 40 }: { size?: number }) => <ShieldCheckIcon variant="filled" color="#047857" size={size} />;

export const ShieldIcon = () => <ShieldCheckIcon size={24} />;
export const RefreshIcon = () => <ResetIcon size={18} />;
export const LockIcon = () => <YLock size={18} />;
export const DownloadIcon = () => <InstallIcon size={18} />;
export const AlertIcon = () => <YAlert size={20} />;
export const SparkIcon = () => <YSpark size={20} />;
export const SitesIcon = () => <GlobeIcon size={20} />;
export const ReposIcon = () => <CodeIcon size={20} />;
export const DownloadsIcon = () => <BarChartIcon size={20} />;
export const XerjIcon = () => <HubIcon size={20} />;
export const ActivityIcon = () => <ChatIcon size={20} />;
