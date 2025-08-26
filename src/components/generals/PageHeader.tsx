import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import '@/styles/PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle: string;
    backButtonText?: string;
    backButtonPath?: string;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    showUserAvatar?: boolean;
    userAvatarSize?: 'sm' | 'md' | 'lg';
    showUserName?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    backButtonText = "Menú",
    backButtonPath = "/dashboard",
    isDarkMode,
    onThemeToggle,
    showUserAvatar = true,
    userAvatarSize = "md",
    showUserName = true
}) => {
    const navigate = useNavigate();

    return (
        <header className="clean-header">
            <div className="header-content">
                <div className="header-left">
                    <button
                        onClick={() => navigate(backButtonPath)}
                        className="back-button"
                    >
                        <ArrowLeft size={20} />
                        <span>{backButtonText}</span>
                    </button>
                </div>

                <div className="header-center">
                    <Logo />
                    <div className="header-title">
                        <h1>{title}</h1>
                        <p>{subtitle}</p>
                    </div>
                </div>

                <div className="header-right">
                    {showUserAvatar && (
                        <UserAvatar
                            showName={showUserName}
                            size={userAvatarSize}
                        />
                    )}
                    <ThemeToggle
                        isDarkMode={isDarkMode}
                        onToggle={onThemeToggle}
                    />
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
