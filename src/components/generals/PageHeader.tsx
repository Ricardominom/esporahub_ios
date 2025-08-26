import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import '@/styles/PageHeader.css';

interface Breadcrumb {
    label: string;
    onClick: () => void;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backButtonText?: string;
    backButtonPath?: string;
    breadcrumbs?: Breadcrumb[];
    showBackButton?: boolean;
    showTitle?: boolean;
    showSubtitle?: boolean;
    showLogo?: boolean;
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
    breadcrumbs,
    showBackButton = true,
    showTitle = true,
    showSubtitle = true,
    showLogo = true,
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
                    {showBackButton && (
                        <button
                            onClick={() => navigate(backButtonPath)}
                            className="back-button"
                        >
                            <ArrowLeft size={20} />
                            <span>{backButtonText}</span>
                        </button>
                    )}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="breadcrumb-container">
                            <span className="breadcrumb-separator">/</span>
                            {breadcrumbs.map((breadcrumb, index) => (
                                <React.Fragment key={index}>
                                    <button
                                        onClick={breadcrumb.onClick}
                                        className="breadcrumb-link"
                                    >
                                        {breadcrumb.label}
                                    </button>
                                    {index < breadcrumbs.length - 1 && (
                                        <span className="breadcrumb-separator">/</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                <div className="header-center">
                    {showLogo && <Logo />}
                    {(showTitle || showSubtitle) && (
                        <div className="header-title">
                            {showTitle && <h1>{title}</h1>}
                            {showSubtitle && subtitle && <p>{subtitle}</p>}
                        </div>
                    )}
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
