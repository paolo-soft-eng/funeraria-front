import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
    const navigate = useNavigate();

    const handleNavClick = (path) => {
        navigate(path);
    };

    const handleOrders = () => {
        navigate("/dashboard-admin/orders");
    };

    const handleClient = () => {
        navigate("/dashboard-admin/clients");
    };

    const handleReports = () => {
        navigate("/dashboard-admin/reports");
    };

    const handleMessage = () => {
        navigate("/dashboard-admin/messages");
    };

    const handleItems = () => {
        navigate("/dashboard-admin/itemlists");
    };

    const handleEditProfile = () => {
        navigate('/dashboard-admin/settings');
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