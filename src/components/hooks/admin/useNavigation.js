import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
    const navigate = useNavigate();

    const handleNavClick = (path) => {
        navigate(path);
    };

    const handleOrders = () => {
        navigate("/gomez/dashboard-admin/orders");
    };

    const handleClient = () => {
        navigate("/gomez/dashboard-admin/clients");
    };

    const handleReports = () => {
        navigate("/gomez/dashboard-admin/reports");
    };

    const handleMessage = () => {
        navigate("/gomez/dashboard-admin/messages");
    };

    const handleItems = () => {
        navigate("/gomez/dashboard-admin/itemlists");
    };

    const handleEditProfile = () => {
        navigate('/gomez/dashboard-admin/settings');
    };

    return {
        handleNavClick,
        handleOrders,
        handleClient,
        handleReports,
        handleMessage,
        handleItems,
        handleEditProfile
    };
};