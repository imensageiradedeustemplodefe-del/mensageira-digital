import { NotificationCenter } from '@/components/NotificationCenter';

const NotificationSettingsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationCenter />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;