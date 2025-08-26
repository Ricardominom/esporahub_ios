import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';

interface ChecklistHeaderProps {
    clientName: string;
    completedCount: number;
    totalCount: number;
}

const ChecklistHeader: React.FC<ChecklistHeaderProps> = ({
    clientName,
    completedCount,
    totalCount
}) => {
    const navigate = useNavigate();
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="checklist-header">
            <div className="header-left">
                <div className="breadcrumb-container">
                    <span className="breadcrumb-separator">/</span>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="breadcrumb-link"
                    >
                        Menú
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <button
                        onClick={() => navigate('/overview-main')}
                        className="breadcrumb-link"
                    >
                        Overview
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <button
                        onClick={() => navigate('/overview')}
                        className="breadcrumb-link"
                    >
                        Configuración
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <button
                        onClick={() => navigate('/select-account')}
                        className="breadcrumb-link"
                    >
                        Seleccionar
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <button
                        onClick={() => navigate('/client-dashboard', { state: { clientName } })}
                        className="breadcrumb-link"
                    >
                        {clientName ? clientName.split(' - ')[0] : 'Cliente'}
                    </button>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-link current-page">
                        EHO
                    </span>
                </div>
            </div>

            <div className="header-info">
                <h1 className="page-title">Engagement Hands-Off</h1>
                <h2 className="client-name">{clientName}</h2>
            </div>

            <div className="header-right">
                <div className="progress-info">
                    <span className="progress-text">
                        {completedCount} de {totalCount} completados
                    </span>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
                <Logo />
            </div>
        </div>
    );
};

export default ChecklistHeader;
