
import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, children, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg"
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={`w-6 h-6 ${className || ''}`} 
        {...props}
    >
        {children}
    </svg>
);

export const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </Icon>
);

export const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </Icon>
);

export const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </Icon>
);

export const LogoutIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </Icon>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </Icon>
);

export const DeleteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </Icon>
);

export const AddIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 mr-2 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </Icon>
);

export const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 mr-2 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.223 48.223 0 0012 2.25z" />
    </Icon>
);

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
    </Icon>
);

export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </Icon>
);

export const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </Icon>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
    <Icon {...props} className={`w-5 h-5 transition-transform duration-300 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </Icon>
);

export const SortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-3 h-3 ${props.className || ''}`} fill="currentColor">
        <path d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </Icon>
);

export const SortAscIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-3 h-3 ${props.className || ''}`} fill="currentColor">
        <path d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
    </Icon>
);

export const SortDescIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
     <Icon {...props} className={`w-3 h-3 ${props.className || ''}`} fill="currentColor">
        <path d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" />
    </Icon>
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className = "w-5 h-5", ...props }) => (
    <Icon {...props} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Icon>
);

export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-4 h-4 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </Icon>
);

export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-4 h-4 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </Icon>
);

export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.473-.188c.54-.215 1.154.113 1.37.653l.094.283c.068.204.068.418 0 .622l-.094.283a.875.875 0 01-1.37.653l-.473-.188a.875.875 0 00-1.11-1.227zM10.343 18.257c-.09.542-.56 1.007-1.11 1.227l-.473.188a.875.875 0 01-1.37-.653l-.094-.283a.875.875 0 010-.622l.094-.283c.216-.54.83-.868 1.37-.653l.473.188a.875.875 0 001.11 1.227zM19.03 7.398c.54-.216.868-.83 1.11-1.37l.094-.283c.068-.204.068-.418 0-.622l-.094-.283a.875.875 0 00-1.37-.653l-.473.188a.875.875 0 01-1.11-1.227c.09-.542.56-1.007 1.11-1.227L19.03 3.94c.54.216.868.83 1.11 1.37l.094.283c.068.204.068.418 0 .622l-.094.283a.875.875 0 01-1.37.653l-.473-.188a.875.875 0 00-1.11 1.227zM4.97 16.602c-.54.216-.868.83-1.11 1.37l-.094.283a.875.875 0 010 .622l.094.283c.216.54.83.868 1.37.653l.473-.188a.875.875 0 001.11-1.227c-.09-.542-.56-1.007-1.11-1.227L4.97 16.602zM15.25 10.5a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0zM10.5 10.5a1.25 1.25 0 112.5 0 1.25 1.25 0 01-2.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a8.25 8.25 0 100 16.5 8.25 8.25 0 000-16.5zM12 3.75v.008" />
    </Icon>
);

export const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </Icon>
);

export const DocumentReportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5v-1.5h-1.5v1.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5h3.75m-3.75 3h3.75M6 19.5h3.75m-3.75-9h1.5v-1.5h-1.5v1.5zm1.5 3h1.5v-1.5h-1.5v1.5zm1.5 3h1.5v-1.5h-1.5v1.5z" />
    </Icon>
);

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c.24 0 .468.02.69.055m-1.38 0a9.01 9.01 0 01-3.412-1.923M12 3c.24 0 .468-.02.69-.055m-1.38 0a9.01 9.01 0 00-3.412 1.923m11.132 10.435A9.01 9.01 0 0012.001 3c-1.895 0-3.66.57-5.042 1.525M4.958 17.475A9.003 9.003 0 0012 3c1.895 0 3.66-.57 5.042-1.525m-10.084 16.05A9.004 9.004 0 0112 21z" />
    </Icon>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </Icon>
);

export const ExclamationCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </Icon>
);

// --- Sub-menu Icons ---
export const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5" /></Icon>);
export const CashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>);
export const ReceiptTaxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m0 0H3m9 0H9m12-9.75H3.75a1.125 1.125 0 00-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h16.5a1.125 1.125 0 001.125-1.125V6.375a1.125 1.125 0 00-1.125-1.125z" /></Icon>);
export const BanknotesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></Icon>);
export const DocumentDuplicateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.375 2.25c.621 0 1.125.504 1.125 1.125v3.375c0 .621-.504 1.125-1.125 1.125h-3.375a1.125 1.125 0 01-1.125-1.125v-3.375c0-.621.504-1.125 1.125-1.125h3.375z" /></Icon>);
export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></Icon>);
export const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.093-.828l1.84-6.991c.113-.424-.042-.877-.373-1.171A2.062 2.062 0 0017.25 5.25H5.64" /></Icon>);
export const ArchiveBoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></Icon>);
export const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5h4.5m-4.5 0V6" /></Icon>);
export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.964A3 3 0 019 12a3 3 0 01-3 3m0 0a3 3 0 00-3 3m9-9a3 3 0 013-3a3 3 0 013 3m-9 9a3 3 0 00-3 3" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3.072a9.094 9.094 0 00-3.741.479 3 3 0 004.682 2.72m7.5 2.964a3 3 0 01-3 3a3 3 0 01-3-3m0 0a3 3 0 00-3-3a3 3 0 00-3 3m9 9a3 3 0 01-3 3a3 3 0 01-3-3m3-12a3 3 0 00-3-3a3 3 0 00-3 3" /></Icon>);
export const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" /></Icon>);
export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663l.001.109m-8.374 2.417c.325.09.668.142 1.022.142.92 0 1.797-.263 2.516-.709 1.022-.642 2.287-2.072 3.533-3.711m-8.374 2.417c.608.569 1.396 1.06 2.253 1.394M3.375 11.178c.325.09.668.142 1.022.142.92 0 1.797-.263 2.516-.709 1.022-.642 2.287-2.072 3.533-3.711m-8.374 2.417L4.625 15.375" /></Icon>);
export const ArchiveBoxArrowDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></Icon>);
export const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></Icon>);
export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></Icon>);
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </Icon>
);
export const GlobeAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664l.143.258a1.107 1.107 0 001.161.886l.143-.048a2.25 2.25 0 011.161.886l.51.766c.319.48.226 1.121-.216 1.49l-1.068.89a1.125 1.125 0 00-.405.864v.568m-6 0v-.568c0-.334-.148-.65-.405-.864l-1.068-.89a1.125 1.125 0 01-.216-1.49l.51-.766a2.25 2.25 0 001.161-.886l.143-.048a1.107 1.107 0 01.57-1.664l-.143-.258a1.107 1.107 0 01-1.161-.886l-.143.048a2.25 2.25 0 00-1.161-.886l-.51-.766a1.125 1.125 0 01.216-1.49l1.068-.89a1.125 1.125 0 00.405-.864v-.568m0 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></Icon>);
export const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.5 0a3.375 3.375 0 00-3.375 3.375v11.25c0 1.864 1.511 3.375 3.375 3.375h9.75c1.864 0 3.375-1.511 3.375-3.375V9.375" /></Icon>);
export const ShipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75h7.5m-7.5-3H12m2.25-3H6.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H12M12 4.875v10.5M12 4.875c-1.28 0-2.5.8-3.375 2.25c-.875 1.45-1.125 3.25-1.125 4.875s.25 3.425 1.125 4.875C9.5 18.45 10.72 19.25 12 19.25s2.5-.8 3.375-2.25c.875-1.45 1.125-3.25 1.125-4.875s-.25-3.425-1.125-4.875C14.5 5.675 13.28 4.875 12 4.875z" /></Icon>);
export const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></Icon>);
export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></Icon>);
export const MapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<Icon {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-10.5v1.5m-6.75-3v1.5m-6.75-3v1.5m19.5 0v1.5m-6.75-1.5v1.5m-6.75-1.5v1.5M9 15l-3 3m0 0l-3-3m3 3V6.75m6 6l3 3m0 0l3-3m-3 3V9.75" /></Icon>);

// --- Export Icons ---
export const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </Icon>
);

export const DocumentDownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
  </Icon>
);

export const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
  </Icon>
);

// --- New Icons for Actions ---
export const EditIconAlt: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 5 4 4" />
    </Icon>
);

export const DeleteIconAlt: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18m-2 0v14c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2V6m3 0V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
       <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6m4-6v6" />
    </Icon>
);

export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props} className={`w-5 h-5 ${props.className || ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </Icon>
);
