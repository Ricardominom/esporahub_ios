import React, { useRef, useEffect } from 'react';
import ChecklistTable from './ChecklistTable';
import { User } from '@/data/users';

interface ChecklistItem {
    id: string;
    concept: string;
    section: string;
    sectionId: string;
    completed: boolean;
}

interface ChecklistTableContainerProps {
    orderedSections: string[];
    groupedItems: Record<string, ChecklistItem[]>;
    users: Omit<User, 'password'>[];
    dueDates: { [key: string]: string };
    currentUser: User | null;
    hasPermission: (user: User | null, permission: string) => boolean;
    toggleItemCompletion: (itemId: string) => void;
    handleDeleteItem: (itemId: string) => void;
    handleUserAssignment: (itemId: string, userId: string) => void;
    handleDueDateChange: (itemId: string, date: string) => void;
    getFieldValue: (itemId: string, fieldName: string) => string;
    openModal: (
        itemId: string,
        fieldName: string,
        fieldType?: 'text' | 'number' | 'select',
        selectOptions?: { value: string; label: string }[]
    ) => void;
}

const ChecklistTableContainer: React.FC<ChecklistTableContainerProps> = (props) => {
    // Refs for scroll synchronization
    const horizontalScrollRef = useRef<HTMLDivElement>(null);
    const tableMainContainerRef = useRef<HTMLDivElement>(null);

    // Mouse wheel horizontal scroll handler
    useEffect(() => {
        const handleWheelScroll = (e: WheelEvent) => {
            // Check if we're scrolling over the table area
            const tableContainer = tableMainContainerRef.current;
            const horizontalScroll = horizontalScrollRef.current;

            if (!tableContainer || !horizontalScroll) return;

            // Get the table container bounds
            const rect = tableContainer.getBoundingClientRect();
            const isOverTable = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );

            if (isOverTable) {
                // Prevent default vertical scroll
                e.preventDefault();

                // Convert vertical wheel movement to horizontal scroll
                const scrollAmount = e.deltaY * 2; // Multiply for faster scroll
                const currentScrollLeft = tableContainer.scrollLeft;
                const newScrollLeft = currentScrollLeft + scrollAmount;

                // Apply scroll to both containers
                tableContainer.scrollLeft = newScrollLeft;
                horizontalScroll.scrollLeft = newScrollLeft;
            }
        };

        // Add event listener to the document
        document.addEventListener('wheel', handleWheelScroll, { passive: false });

        // Cleanup
        return () => {
            document.removeEventListener('wheel', handleWheelScroll);
        };
    }, []);

    return (
        <div className="checklist-table-container">
            {/* Barra de scroll horizontal superior */}
            <div
                ref={horizontalScrollRef}
                className="table-horizontal-scroll"
                onScroll={(e) => {
                    if (tableMainContainerRef.current) {
                        tableMainContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                }}
            >
                <div className="table-scroll-content"></div>
            </div>

            {/* Contenedor principal con scroll vertical */}
            <div
                ref={tableMainContainerRef}
                className="table-main-container"
                onScroll={(e) => {
                    // Sincronizar el scroll horizontal con la barra superior
                    if (horizontalScrollRef.current) {
                        horizontalScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }
                }}
            >
                <ChecklistTable {...props} />
            </div>
        </div>
    );
};

export default ChecklistTableContainer;
