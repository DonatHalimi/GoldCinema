import { motion } from 'framer-motion';
import {
    Armchair,
    BarChart3,
    Building2,
    ClipboardList,
    Clock,
    Film,
    HardDrive,
    Languages,
    LayoutDashboard,
    Lock,
    Mail,
    MonitorPlay,
    Receipt,
    ScrollText,
    ShieldAlert,
    Sparkles,
    TrendingUp,
    UserCog,
    Users,
    UtensilsCrossed,
    Wrench,
} from 'lucide-react';

export const getModuleSections = (t) => [
    {
        title: t('management'),
        icon: LayoutDashboard,
        items: [
            {
                key: 'users',
                label: t('users'),
                icon: Users,
                fields: [
                    { name: 'name', label: t('usersName') },
                    { name: 'email', label: t('usersEmail'), type: 'email' },
                    { name: 'role.name', label: t('usersRole') },
                ],
            },
            {
                key: 'roles',
                label: t('roles'),
                icon: ShieldAlert,
                fields: [
                    { name: 'name', label: t('rolesRoleName') },
                    {
                        name: 'description',
                        label: t('rolesDescription'),
                        type: 'textarea',
                    },
                ],
            },
            {
                key: 'contacts',
                label: t('contacts'),
                icon: Mail,
                fields: [
                    { name: 'name', label: t('contactsSenderName') },
                    {
                        name: 'email',
                        label: t('contactsEmail'),
                        type: 'email',
                    },
                    { name: 'subject', label: t('contactsSubject') },
                    {
                        name: 'message',
                        label: t('contactsMessage'),
                        type: 'textarea',
                    },
                    {
                        name: 'status',
                        label: t('contactsStatus'),
                        type: 'select',
                        options: ['unread', 'read', 'resolved'],
                    },
                ],
            },
            {
                key: 'auditlogs',
                label: t('auditLogs'),
                icon: ScrollText,
                fields: [
                    { name: 'user', label: t('auditLogsUser') },
                    { name: 'action', label: t('auditLogsAction') },
                    { name: 'timestamp', label: t('auditLogsTimestamp') },
                    { name: 'ip', label: t('auditLogsIpAddress') },
                    { name: 'userAgent', label: t('auditLogsUserAgent') },
                ],
            },
            {
                key: 'translations',
                label: t('translations'),
                icon: Languages,
                fields: [
                    {
                        name: 'namespace',
                        label: t('translationsNamespace'),
                        span: 1,
                    },
                    {
                        name: 'key',
                        label: t('translationsKey'),
                        span: 1,
                    },
                    {
                        name: 'values.en',
                        label: t('translationsEnglish'),
                        type: 'textarea',
                    },
                    {
                        name: 'values.sq',
                        label: t('translationsAlbanian'),
                        type: 'textarea',
                    },
                    {
                        name: 'values.sr-Latn',
                        label: t('translationsSerbianLatin'),
                        type: 'textarea',
                    },
                    {
                        name: 'context',
                        label: t('translationsTranslatorNotes'),
                        type: 'textarea',
                    },
                ],
            },
        ],
    },

    {
        title: t('catalogCinema'),
        icon: Film,
        items: [
            {
                key: 'movies',
                label: t('movies'),
                icon: Film,
                fields: [
                    { name: 'title', label: t('moviesTitle') },
                    {
                        name: 'genres',
                        label: t('moviesGenres'),
                        type: 'array',
                    },
                    {
                        name: 'duration',
                        label: t('moviesDurationMins'),
                        type: 'number',
                    },
                    {
                        name: 'rating',
                        label: t('moviesRatingExample'),
                    },
                    {
                        name: 'price',
                        label: t('moviesBasePrice'),
                        type: 'number',
                    },
                    {
                        name: 'releaseDate',
                        label: t('moviesReleaseDate'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )
                                : '-',
                    },
                ],
                formFields: [
                    {
                        name: 'title',
                        label: t('moviesTitle'),
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'slug',
                        label: t('moviesSlug'),
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'genres',
                        label: t('moviesGenres'),
                        type: 'text',
                        placeholder: 'Action, Drama, Comedy',
                        defaultValue: '',
                        span: 1,
                    },
                    {
                        name: 'duration',
                        label: t('moviesDurationMins'),
                        type: 'number',
                        required: true,
                        min: 1,
                        span: 1,
                    },
                    {
                        name: 'description',
                        label: t('moviesDescription'),
                        type: 'textarea',
                        required: true,
                    },
                    {
                        name: 'posterUrl',
                        label: t('moviesPosterUrl'),
                        type: 'url',
                        required: true,
                    },
                    {
                        name: 'trailerUrl',
                        label: t('moviesTrailerUrl'),
                        type: 'url',
                        defaultValue: '',
                    },
                    {
                        name: 'rating',
                        label: t('moviesRating'),
                        type: 'select',
                        options: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
                        required: true,
                        defaultValue: 'PG-13',
                        span: 1,
                    },
                    {
                        name: 'releaseDate',
                        label: t('moviesReleaseDate'),
                        type: 'date',
                        span: 1,
                    },
                    {
                        name: 'active',
                        label: t('moviesActive'),
                        type: 'checkbox',
                        defaultValue: true,
                        span: 1,
                    },
                    {
                        name: 'price',
                        label: t('moviesBasePrice'),
                        type: 'number',
                        required: true,
                        min: 0,
                        step: 0.01,
                        span: 1,
                    },
                    {
                        name: 'averageRating',
                        label: t('moviesAverageRating'),
                        type: 'number',
                        min: 0,
                        max: 5,
                        step: 0.1,
                        defaultValue: 0,
                        span: 1,
                    },
                    {
                        name: 'reviewCount',
                        label: t('moviesReviewCount'),
                        type: 'number',
                        min: 0,
                        defaultValue: 0,
                        span: 1,
                    },
                ],
            },

            {
                key: 'cinemas',
                label: t('cinemas'),
                icon: Building2,
                fields: [
                    {
                        name: 'name',
                        label: t('cinemasName'),
                        span: 1,
                    },
                    {
                        name: 'location.address',
                        label: t('cinemasAddress'),
                        span: 1,
                    },
                    {
                        name: 'location.country',
                        label: t('cinemasCountry'),
                        span: 1,
                    },
                    {
                        name: 'location.city',
                        label: t('cinemasCity'),
                        span: 1,
                    },
                ],
            },

            {
                key: 'screens',
                label: t('screens'),
                icon: MonitorPlay,
                fields: [
                    {
                        name: 'cinema._id',
                        label: t('screensCinemaId'),
                        span: 1,
                    },
                    {
                        name: 'screenNumber',
                        label: t('screensScreenNumber'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'cinema.name',
                        label: t('screensCinemaName'),
                    },
                ],
            },

            {
                key: 'screen-configurations',
                label: t('screenConfigs'),
                icon: HardDrive,
                fields: [
                    {
                        name: 'screen.name',
                        label: t('screenConfigsScreen'),
                        span: 1,
                    },
                    {
                        name: 'screenType',
                        label: t('screenConfigsType'),
                        type: 'select',
                        options: [
                            'standard',
                            'imax',
                            '4dx',
                            'screenx',
                            'dolby',
                        ],
                        span: 1,
                    },
                    {
                        name: 'soundSystem',
                        label: t('screenConfigsSoundSystem'),
                        span: 1,
                    },
                    {
                        name: 'projectorType',
                        label: t('screenConfigsProjector'),
                        span: 1,
                    },
                    {
                        name: 'has3D',
                        label: t('screenConfigsThreeD'),
                        type: 'checkbox',
                        span: 1,
                    },
                    {
                        name: 'hasHFR',
                        label: t('screenConfigsHfr'),
                        type: 'checkbox',
                        span: 1,
                    },
                ],
            },

            {
                key: 'seats',
                label: t('seats'),
                icon: Armchair,
                fields: [
                    {
                        name: 'row',
                        label: t('seatsRowExample'),
                        span: 1,
                    },
                    {
                        name: 'number',
                        label: t('seatsNumberExample'),
                        span: 1,
                    },
                    {
                        name: 'status',
                        label: t('seatsStatus'),
                        type: 'select',
                        options: ['active', 'maintenance'],
                        span: 1,
                    },
                    {
                        name: 'type',
                        label: t('seatsType'),
                        type: 'select',
                        options: [
                            'standard',
                            'recliner',
                            'wheelchair',
                            'love-seat',
                        ],
                        span: 1,
                    },
                    {
                        name: 'column',
                        label: t('seatsColumnIndex'),
                        type: 'number',
                    },
                ],
            },

            {
                key: 'showtimes',
                label: t('showtimes'),
                icon: Clock,
                fields: [
                    {
                        name: 'startTime',
                        label: t('showtimesStartTime'),
                        type: 'datetime-local',
                        span: 1,
                    },
                    {
                        name: 'movie',
                        label: t('showtimesMovieId'),
                        span: 1,
                    },
                    {
                        name: 'screen',
                        label: t('showtimesScreenId'),
                        span: 1,
                    },
                    {
                        name: 'price',
                        label: t('showtimesTicketPrice'),
                        type: 'number',
                        span: 1,
                    },
                ],
            },

            {
                key: 'seatholds',
                label: t('seatHolds'),
                icon: Lock,
                fields: [
                    {
                        name: 'showtime',
                        label: t('seatHoldsShowtimeId'),
                        span: 1,
                    },
                    {
                        name: 'user',
                        label: t('seatHoldsUserId'),
                        span: 1,
                    },
                    {
                        name: 'expiresAt',
                        label: t('seatHoldsExpiresAt'),
                        type: 'datetime-local',
                    },
                ],
            },

            {
                key: 'snacks',
                label: t('snacks'),
                icon: UtensilsCrossed,
                fields: [
                    {
                        name: 'name',
                        label: t('snacksName'),
                        span: 1,
                    },
                    {
                        name: 'category',
                        label: t('snacksCategory'),
                        type: 'select',
                        options: [
                            'popcorn',
                            'drink',
                            'candy',
                            'combo',
                            'other',
                        ],
                        span: 1,
                    },
                    {
                        name: 'available',
                        label: t('snacksAvailable'),
                        type: 'checkbox',
                        span: 1,
                    },
                    {
                        name: 'price',
                        label: t('snacksPrice'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'image',
                        label: t('snacksImage'),
                        type: 'image',
                    },
                ],
            },
        ],
    },

    {
        title: t('sales'),
        icon: Receipt,
        items: [
            {
                key: 'orders',
                label: t('orders'),
                icon: Receipt,
                fields: [
                    {
                        name: 'user',
                        label: t('ordersUser'),
                        format: (value) =>
                            value?.name || value?.fullName || '-',
                        span: 1,
                    },
                    {
                        name: 'movie',
                        label: t('ordersMovie'),
                        format: (value) => value?.title || '-',
                        span: 1,
                    },
                    {
                        name: 'showtime',
                        label: t('ordersShowtime'),
                        format: (value) =>
                            value?.startTime
                                ? new Date(
                                    value.startTime
                                ).toLocaleString('en-US', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'totalAmount',
                        label: t('ordersTotalAmount'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'paymentStatus',
                        label: t('ordersPaymentStatus'),
                    },
                    {
                        name: 'paymentProvider',
                        label: t('ordersPaymentProvider'),
                    },
                ],
            },
        ],
    },

    {
        title: t('staffOperations'),
        icon: UserCog,
        items: [
            {
                key: 'staff',
                label: t('staff'),
                icon: UserCog,
                fields: [
                    {
                        name: 'user',
                        label: t('staffUser'),
                        format: (value) =>
                            value?.name || value?.email || '-',
                        span: 1,
                    },
                    {
                        name: 'employeeId',
                        label: t('staffEmployeeId'),
                        span: 1,
                    },
                    {
                        name: 'position',
                        label: t('staffPosition'),
                        type: 'select',
                        options: [
                            'usher',
                            'cashier',
                            'projectionist',
                            'manager',
                            'cleaner',
                        ],
                        span: 1,
                    },
                    {
                        name: 'cinema',
                        label: t('staffCinema'),
                        format: (value) => value?.name || '-',
                        span: 1,
                    },
                    {
                        name: 'isActive',
                        label: t('staffActive'),
                        type: 'checkbox',
                        span: 1,
                    },
                    {
                        name: 'hireDate',
                        label: t('staffHireDate'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'hourlyRate',
                        label: t('staffHourlyRate'),
                        type: 'number',
                    },
                ],
            },

            {
                key: 'shifts',
                label: t('shifts'),
                icon: ClipboardList,
                fields: [
                    {
                        name: 'staff',
                        label: t('shiftsStaff'),
                        format: (value) =>
                            value?.employeeId || value?._id || '-',
                        span: 1,
                    },
                    {
                        name: 'cinema',
                        label: t('shiftsCinema'),
                        format: (value) => value?.name || '-',
                        span: 1,
                    },
                    {
                        name: 'startTime',
                        label: t('shiftsStart'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleString(
                                    'en-US',
                                    {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'endTime',
                        label: t('shiftsEnd'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleString(
                                    'en-US',
                                    {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'status',
                        label: t('shiftsStatus'),
                        type: 'select',
                        options: [
                            'scheduled',
                            'confirmed',
                            'completed',
                            'no_show',
                            'cancelled',
                        ],
                        span: 1,
                    },
                    {
                        name: 'role',
                        label: t('shiftsRole'),
                        span: 1,
                    },
                ],
            },

            {
                key: 'equipment',
                label: t('equipment'),
                icon: Wrench,
                fields: [
                    {
                        name: 'name',
                        label: t('equipmentName'),
                        span: 1,
                    },
                    {
                        name: 'cinema',
                        label: t('equipmentCinema'),
                        format: (value) => value?.name || '-',
                        span: 1,
                    },
                    {
                        name: 'serialNumber',
                        label: t('equipmentSerialNumber'),
                        span: 1,
                    },
                    {
                        name: 'purchaseDate',
                        label: t('equipmentPurchased'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'type',
                        label: t('equipmentType'),
                        type: 'select',
                        options: [
                            'projector',
                            'sound',
                            'hvac',
                            'pos',
                            'lighting',
                            'other',
                        ],
                        span: 1,
                    },
                    {
                        name: 'status',
                        label: t('equipmentStatus'),
                        type: 'select',
                        options: [
                            'operational',
                            'maintenance',
                            'broken',
                            'retired',
                        ],
                        span: 1,
                    },
                ],
            },

            {
                key: 'maintenance-logs',
                label: t('maintenance'),
                icon: Wrench,
                fields: [
                    {
                        name: 'equipment',
                        label: t('maintenanceEquipment'),
                        format: (value) => value?.name || '-',
                    },
                    {
                        name: 'description',
                        label: t('maintenanceDescription'),
                        type: 'textarea',
                    },
                    {
                        name: 'cost',
                        label: t('maintenanceCost'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'maintenanceType',
                        label: t('maintenanceType'),
                        type: 'select',
                        options: [
                            'routine',
                            'repair',
                            'inspection',
                            'emergency',
                        ],
                        span: 1,
                    },
                    {
                        name: 'performedBy',
                        label: t('maintenancePerformedBy'),
                        span: 1,
                    },
                    {
                        name: 'performedAt',
                        label: t('maintenancePerformedAt'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleString(
                                    'en-US',
                                    {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                ],
            },
        ],
    },

    {
        title: t('analytics'),
        icon: BarChart3,
        items: [
            {
                key: 'movie-performance',
                label: t('moviePerformance'),
                icon: TrendingUp,
                fields: [
                    {
                        name: 'movie',
                        label: t('moviePerformanceMovie'),
                        format: (value) => value?.title || '-',
                        span: 1,
                    },
                    {
                        name: 'date',
                        label: t('moviePerformanceDate'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'showtimeCount',
                        label: t('moviePerformanceShowtimes'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'ticketsSold',
                        label: t('moviePerformanceTicketsSold'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'revenue',
                        label: t('moviePerformanceRevenue'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'averageOccupancy',
                        label: t('moviePerformanceAvgOccupancy'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'rating',
                        label: t('moviePerformanceRating'),
                        type: 'number',
                    },
                ],
            },

            {
                key: 'customer-analytics',
                label: t('customerAnalytics'),
                icon: Sparkles,
                fields: [
                    {
                        name: 'user',
                        label: t('customerAnalyticsUser'),
                        format: (value) =>
                            value?.name || value?.email || '-',
                        span: 1,
                    },
                    {
                        name: 'totalSpent',
                        label: t('customerAnalyticsTotalSpent'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'visitCount',
                        label: t('customerAnalyticsVisits'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'favouriteGenre',
                        label: t('customerAnalyticsFavouriteGenre'),
                        span: 1,
                    },
                    {
                        name: 'lastVisitDate',
                        label: t('customerAnalyticsLastVisit'),
                        format: (value) =>
                            value
                                ? new Date(value).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    }
                                )
                                : '-',
                        span: 1,
                    },
                    {
                        name: 'lifetimeValue',
                        label: t('customerAnalyticsLifetimeValue'),
                        type: 'number',
                        span: 1,
                    },
                    {
                        name: 'churnRisk',
                        label: t('customerAnalyticsChurnRisk'),
                        type: 'select',
                        options: ['low', 'medium', 'high', 'unknown'],
                    },
                ],
            },
        ],
    },
];

export const renderAdminItems = (
    items,
    navigate,
    activeModule
) =>
    items.map((item) => {
        if (item.items) {
            return (
                <div key={item.title} className="space-y-1">
                    <div className="pl-4 pt-2 text-[10px] font-bold uppercase tracking-widest text-marquee-muted/50">
                        {item.title}
                    </div>

                    {renderAdminItems(
                        item.items,
                        navigate,
                        activeModule
                    )}
                </div>
            );
        }

        const isActive = activeModule?.key === item.key;
        const IconComponent = item.icon;

        return (
            <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/admin/${item.key}`)}
                className={`
                    relative group flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5 text-sm font-medium
                    border transition-all duration-300 z-10
                    ${isActive
                        ? 'text-marquee-goldBright font-bold border-transparent'
                        : 'text-marquee-muted border-transparent hover:text-marquee-goldBright hover:bg-marquee-gold/5 hover:border-marquee-gold/15 hover:shadow-[0_0_12px_-4px_rgba(230,199,115,0.25)]'
                    }
                `}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeAdminNavBg"
                        transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30,
                        }}
                        className="absolute inset-0 rounded-xl bg-marquee-gold/10 border border-marquee-gold/20 -z-10"
                    />
                )}

                {IconComponent && (
                    <IconComponent
                        size={18}
                        className={`transition-colors duration-300 ${isActive
                            ? 'text-marquee-gold'
                            : 'text-marquee-muted/70 group-hover:text-marquee-gold'
                            }`}
                    />
                )}

                <span className="tracking-wide">
                    {item.label}
                </span>
            </button>
        );
    });

const flattenModules = (items) =>
    items.flatMap((item) =>
        item.key
            ? [item]
            : item.items
                ? flattenModules(item.items)
                : []
    );

export const getAllModules = (t) =>
    getModuleSections(t).flatMap((section) =>
        flattenModules(section.items)
    );