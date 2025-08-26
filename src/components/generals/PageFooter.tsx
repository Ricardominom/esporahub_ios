import React from 'react';
import { LogOut } from 'lucide-react';
import LogoutDialog from './LogoutDialog';
import '@/styles/PageFooter.css';

interface PageFooterProps {
    showLogoutDialog: boolean;
    onLogoutClick: () => void;
    onLogoutDialogClose: () => void;
}

const PageFooter: React.FC<PageFooterProps> = ({
    showLogoutDialog,
    onLogoutClick,
    onLogoutDialogClose
}) => {
    return (
        <>
            <footer className="clean-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <span className="footer-text">© 2025 Esporahub</span>
                    </div>
                    <div className="footer-right">
                        <button
                            className="logout-btn"
                            onClick={onLogoutClick}
                        >
                            <LogOut size={16} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </footer>

            <LogoutDialog
                isOpen={showLogoutDialog}
                onClose={onLogoutDialogClose}
            />
        </>
    );
};

export default PageFooter;
