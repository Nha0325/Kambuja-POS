<!-- Platform Dashboard - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kambuja Platform - Dashboard</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-fixed": "#1b1b1b",
                    "inverse-on-surface": "#f0f1f2",
                    "surface-container": "#edeeef",
                    "primary-fixed-dim": "#c6c6c6",
                    "tertiary": "#000000",
                    "secondary-fixed-dim": "#c0c1ff",
                    "on-surface-variant": "#4c4546",
                    "on-surface": "#191c1d",
                    "error-container": "#ffdad6",
                    "tertiary-container": "#1b1b1b",
                    "surface-variant": "#e1e3e4",
                    "background": "#f8f9fa",
                    "surface-container-low": "#f3f4f5",
                    "surface": "#f8f9fa",
                    "on-secondary-fixed": "#07006c",
                    "surface-container-highest": "#e1e3e4",
                    "surface-bright": "#f8f9fa",
                    "primary-container": "#1b1b1b",
                    "on-tertiary-fixed-variant": "#474747",
                    "on-tertiary-container": "#848484",
                    "inverse-surface": "#2e3132",
                    "on-error-container": "#93000a",
                    "on-tertiary": "#ffffff",
                    "secondary-container": "#6063ee",
                    "tertiary-fixed-dim": "#c6c6c6",
                    "tertiary-fixed": "#e2e2e2",
                    "surface-container-high": "#e7e8e9",
                    "on-background": "#191c1d",
                    "on-primary-fixed-variant": "#474747",
                    "surface-tint": "#5e5e5e",
                    "on-secondary-container": "#fffbff",
                    "primary-fixed": "#e2e2e2",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "outline": "#7e7576",
                    "on-primary-container": "#848484",
                    "surface-container-lowest": "#ffffff",
                    "primary": "#000000",
                    "secondary": "#4648d4",
                    "error": "#ba1a1a",
                    "secondary-fixed": "#e1e0ff",
                    "on-primary-fixed": "#1b1b1b",
                    "outline-variant": "#cfc4c5",
                    "on-secondary-fixed-variant": "#2f2ebe",
                    "on-secondary": "#ffffff",
                    "surface-dim": "#d9dadb",
                    "inverse-primary": "#c6c6c6"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-mobile": "16px",
                    "stack-lg": "32px",
                    "sidebar-width": "260px",
                    "stack-sm": "8px",
                    "stack-md": "16px",
                    "container-max": "1200px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "headline-md-mobile": ["Hanken Grotesk"],
                    "label-caps": ["Inter"],
                    "code-sm": ["Inter"],
                    "headline-md": ["Hanken Grotesk"],
                    "body-md": ["Inter"],
                    "title-sm": ["Inter"],
                    "display-lg": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "headline-md-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                    "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
        }
        @media (max-width: 1024px) {
            .bento-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        @media (max-width: 640px) {
            .bento-grid {
                grid-template-columns: 1fr;
            }
        }
        .scroll-hide::-webkit-scrollbar {
            display: none;
        }
        .metric-card {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .metric-card:active {
            transform: scale(0.98);
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md text-body-md overflow-x-hidden">
<!-- Sidebar Component (Fixed-Fluid Hybrid Model) -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter z-50 transition-transform duration-300 md:translate-x-0 -translate-x-full" id="sidebar">
<!-- Brand Header -->
<div class="mb-10">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="font-label-caps text-label-caps text-on-surface-variant mt-1">Shop Management</p>
</div>
<!-- Navigation Links -->
<nav class="flex-grow space-y-2">
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-xl transition-all duration-150 scale-[0.99]" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">dashboard</span>
<span class="font-title-sm text-title-sm">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">storefront</span>
<span class="font-title-sm text-title-sm">Shops</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">manage_accounts</span>
<span class="font-title-sm text-title-sm">Admin Accounts</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">analytics</span>
<span class="font-title-sm text-title-sm">Platform Reports</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">terminal</span>
<span class="font-title-sm text-title-sm">System Logs</span>
</a>
</nav>
<!-- Sidebar Footer/Settings -->
<div class="mt-auto pt-6 border-t border-outline-variant">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">settings</span>
<span class="font-title-sm text-title-sm">Settings</span>
</a>
</div>
</aside>
<!-- Main Content Area -->
<main class="md:ml-[260px] min-h-screen flex flex-col">
<!-- TopAppBar Component -->
<header class="h-16 px-gutter flex justify-between items-center bg-background border-b border-outline-variant sticky top-0 z-40">
<div class="flex items-center gap-4">
<button class="md:hidden p-2 hover:bg-surface-container rounded-full" id="mobile-menu-toggle">
<span class="material-symbols-outlined">menu</span>
</button>
<h2 class="font-headline-md text-headline-md font-bold text-primary">Platform Dashboard</h2>
</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4 text-on-surface-variant">
<button class="hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined">help</span>
</button>
</div>
<div class="h-8 w-px bg-outline-variant"></div>
<div class="flex items-center gap-3">
<div class="text-right hidden sm:block">
<p class="font-title-sm text-title-sm leading-tight">Pkay Admin</p>
<p class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">Super Administrator</p>
</div>
<div class="w-10 h-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant">person</span>
</div>
</div>
</div>
</header>
<!-- Dashboard Canvas -->
<div class="p-gutter max-w-[1200px] mx-auto w-full flex-grow space-y-gutter">
<!-- Welcome Header (Atmospheric) -->
<section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h3 class="font-headline-md text-headline-md">Overview Metrics</h3>
<p class="text-on-surface-variant">Real-time performance across the Kambuja ecosystem.</p>
</div>
<div class="flex gap-3">
<button class="px-4 py-2 border border-primary font-title-sm text-title-sm rounded-lg hover:bg-surface-container transition-colors flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
                        Last 30 Days
                    </button>
<button class="px-4 py-2 bg-primary text-on-primary font-title-sm text-title-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">download</span>
                        Export PDF
                    </button>
</div>
</section>
<!-- Metrics Bento Grid -->
<section class="bento-grid">
<!-- Shops Card -->
<div class="bg-white p-6 border border-outline-variant rounded-lg metric-card">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-surface-container-low rounded-lg">
<span class="material-symbols-outlined text-primary">storefront</span>
</span>
<span class="text-green-600 font-bold text-[12px] flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">trending_up</span> +12%
                        </span>
</div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Total Shops</p>
<h4 class="font-display-lg text-display-lg">1,284</h4>
</div>
<!-- Admins Card -->
<div class="bg-white p-6 border border-outline-variant rounded-lg metric-card">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-surface-container-low rounded-lg">
<span class="material-symbols-outlined text-primary">manage_accounts</span>
</span>
</div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Platform Admins</p>
<h4 class="font-display-lg text-display-lg">42</h4>
</div>
<!-- Cashiers Card -->
<div class="bg-white p-6 border border-outline-variant rounded-lg metric-card">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-surface-container-low rounded-lg">
<span class="material-symbols-outlined text-primary">badge</span>
</span>
</div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Active Cashiers</p>
<h4 class="font-display-lg text-display-lg">3,109</h4>
</div>
<!-- Sales Card -->
<div class="bg-white p-6 border border-outline-variant rounded-lg metric-card">
<div class="flex justify-between items-start mb-4">
<span class="p-2 bg-surface-container-low rounded-lg">
<span class="material-symbols-outlined text-primary">payments</span>
</span>
<span class="text-green-600 font-bold text-[12px] flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">trending_up</span> +8.4%
                        </span>
</div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Daily Sales</p>
<h4 class="font-display-lg text-display-lg">8,422</h4>
</div>
</section>
<!-- Revenue Visualization (Primary Focus) -->
<section class="bg-white border border-outline-variant rounded-lg overflow-hidden flex flex-col md:flex-row">
<!-- Chart Area -->
<div class="p-8 flex-grow">
<div class="flex justify-between items-center mb-8">
<div>
<h3 class="font-title-sm text-title-sm mb-1">Platform Revenue</h3>
<p class="text-body-md text-on-surface-variant">Total platform processing volume vs previous period.</p>
</div>
<div class="flex items-center gap-2">
<div class="flex items-center gap-1">
<div class="w-3 h-3 bg-primary rounded-full"></div>
<span class="text-[12px] font-semibold">Current</span>
</div>
<div class="flex items-center gap-1 ml-4">
<div class="w-3 h-3 bg-outline-variant rounded-full"></div>
<span class="text-[12px] font-semibold text-on-surface-variant">Last Year</span>
</div>
</div>
</div>
<!-- Mock Visualization using pure CSS/Tailwind -->
<div class="h-64 w-full flex items-end gap-2 sm:gap-4 group">
<!-- Revenue Bar 1 -->
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 45%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">JAN</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 55%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">FEB</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 48%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">MAR</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 72%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">APR</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 65%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">MAY</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 90%;"></div>
<span class="font-label-caps text-[10px] font-bold text-primary">JUN</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 82%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">JUL</span>
</div>
<div class="flex-grow flex flex-col items-center gap-2">
<div class="w-full bg-primary-fixed hover:bg-primary transition-colors cursor-pointer rounded-t-sm" style="height: 76%;"></div>
<span class="font-label-caps text-[10px] text-on-surface-variant">AUG</span>
</div>
</div>
</div>
<!-- Secondary Data/Stats -->
<div class="w-full md:w-80 bg-surface-container-low p-8 border-l border-outline-variant space-y-8">
<div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">YTD Net Revenue</p>
<h4 class="font-headline-md text-headline-md">$1,482,000.42</h4>
<div class="mt-4 flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded">
<span class="material-symbols-outlined text-green-700 text-[18px]">bolt</span>
<span class="text-[12px] font-semibold text-green-800">New peak reached in June 2024</span>
</div>
</div>
<div>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-4">Revenue Sources</p>
<ul class="space-y-4">
<li class="flex justify-between items-center">
<span class="text-body-md">Service Fees</span>
<span class="font-title-sm">62%</span>
</li>
<li class="flex justify-between items-center">
<span class="text-body-md">Subscription</span>
<span class="font-title-sm">28%</span>
</li>
<li class="flex justify-between items-center">
<span class="text-body-md">Add-ons</span>
<span class="font-title-sm">10%</span>
</li>
</ul>
</div>
</div>
</section>
<!-- Bottom Row: Recent Logs & Activity -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter pb-stack-lg">
<!-- Activity Feed -->
<div class="lg:col-span-2 bg-white border border-outline-variant rounded-lg p-8">
<div class="flex justify-between items-center mb-6">
<h3 class="font-title-sm text-title-sm">Recent Platform Activity</h3>
<a class="text-primary hover:underline font-semibold text-[13px]" href="#">View All Logs</a>
</div>
<div class="space-y-4">
<div class="flex items-start gap-4 p-4 hover:bg-surface-container-low transition-colors rounded-lg border border-transparent hover:border-outline-variant">
<div class="w-10 h-10 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center shrink-0">
<span class="material-symbols-outlined">add_business</span>
</div>
<div class="flex-grow">
<p class="text-body-md"><span class="font-bold">Elite Coffee Roasters</span> registered a new shop branch in Phnom Penh.</p>
<p class="text-[12px] text-on-surface-variant mt-1">2 hours ago • Shop Management</p>
</div>
</div>
<div class="flex items-start gap-4 p-4 hover:bg-surface-container-low transition-colors rounded-lg border border-transparent hover:border-outline-variant">
<div class="w-10 h-10 bg-yellow-50 text-yellow-700 rounded-full flex items-center justify-center shrink-0">
<span class="material-symbols-outlined">warning</span>
</div>
<div class="flex-grow">
<p class="text-body-md"><span class="font-bold">System Warning:</span> Database latency detected in Region SE-1.</p>
<p class="text-[12px] text-on-surface-variant mt-1">5 hours ago • Infrastructure</p>
</div>
</div>
<div class="flex items-start gap-4 p-4 hover:bg-surface-container-low transition-colors rounded-lg border border-transparent hover:border-outline-variant">
<div class="w-10 h-10 bg-green-50 text-green-700 rounded-full flex items-center justify-center shrink-0">
<span class="material-symbols-outlined">verified_user</span>
</div>
<div class="flex-grow">
<p class="text-body-md">New admin account <span class="font-bold">Sarah_Tech</span> verified by Pkay Admin.</p>
<p class="text-[12px] text-on-surface-variant mt-1">1 day ago • Security</p>
</div>
</div>
</div>
</div>
<!-- Top Shops -->
<div class="bg-white border border-outline-variant rounded-lg p-8">
<h3 class="font-title-sm text-title-sm mb-6">Top Performing Shops</h3>
<div class="space-y-6">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded bg-surface-container border border-outline-variant overflow-hidden">
<img class="w-full h-full object-cover" data-alt="A clean, minimalist architectural photography of a modern storefront in a busy urban district, high contrast black and white lighting, administrative precision style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPCO2SxWBV07ecwkiasDjR43I649TfDHxt5QkjG6ZRxC2MMzFRmWYkmHPAsjg9aeGpZYdLZKR2CEnKZA96rWgcIMXMhK-HUJ-MoX_JZyDcp4ZWm9W6W5QairGtMX9aJMDehybU5RjzFiH8iAYIEDTUxWT4V5o0rq7Ggp_i0Jg_ur3oUa9W3eFJJpERQx91MxPKAAoAjVDD2zkMQ3sDNiBYZ0nNPNnzZQLfjTYGe-ci5qSfQpSM1NuNTAwsUf_W8RNkBSklMU0yCESh"/>
</div>
<div class="flex-grow">
<p class="font-semibold text-body-md">Grand Mall Boutique</p>
<div class="w-full bg-surface-container h-1.5 rounded-full mt-2">
<div class="bg-primary h-full rounded-full" style="width: 85%;"></div>
</div>
</div>
<span class="font-bold text-[13px]">$12k</span>
</div>
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded bg-surface-container border border-outline-variant overflow-hidden">
<img class="w-full h-full object-cover" data-alt="A crisp, high-end professional photo of a boutique bakery interior, minimalist and corporate aesthetic, soft morning light hitting clean white surfaces." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1ksWrSO0anMpPDS0DAdSAi7foDtW4yXCiGLld8_ZIq9RS7kD6_TzLznvw8WeRxfobk5zPFUBSeEuLivzzKKIEPyedFPl2Sg3cF8DagOAdetsv-kHVjb3MjTyzkZcbhZjthDucz_H-wXBXG1pwFKDFIjVEPVoOc9dg2gPrCZ8WdLRrpso_UzEJ4IcVo_volt57IexLEWfka4RU5916YC2YlBI62_whww716crpL_UJAjtra7PVsiAzV5fEG6vqyBeMDXfzHp4G5mcs"/>
</div>
<div class="flex-grow">
<p class="font-semibold text-body-md">Rise &amp; Bake Cafe</p>
<div class="w-full bg-surface-container h-1.5 rounded-full mt-2">
<div class="bg-primary h-full rounded-full" style="width: 65%;"></div>
</div>
</div>
<span class="font-bold text-[13px]">$9.2k</span>
</div>
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded bg-surface-container border border-outline-variant overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Corporate photography of a sleek technology retail store interior, glass shelves, focused lighting, black and white tonal range." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE8qY_8YuUcJI6v2EMFumsXedLObGq3Qcbrk-y8Sadv9tEnbApxkEaFcmSI1CetCcKi8lvk92vxbhL7twwHIurdP59098dKjVnySelh1p-pLLUNjNqcS4KuQUN-RVH1ufAeKgMDkDDvqseGYwzvMlE7CfS9Hv5RdeBTZ6V9Fi4ALKq7KZHtSzZgUXmX_9vqviWwJIfDhCUdePeM1l1AJew7Sa-_HoDW6pjvtXttl9Yr0t8Oi8Is7GvVMfL5TgOk-C4MbyCRDMPuPEb"/>
</div>
<div class="flex-grow">
<p class="font-semibold text-body-md">K-Tech Express</p>
<div class="w-full bg-surface-container h-1.5 rounded-full mt-2">
<div class="bg-primary h-full rounded-full" style="width: 45%;"></div>
</div>
</div>
<span class="font-bold text-[13px]">$7.8k</span>
</div>
</div>
<button class="w-full mt-10 py-3 border border-outline-variant rounded-lg font-title-sm hover:bg-surface-container-high transition-colors">
                        View Marketplace Leaderboard
                    </button>
</div>
</div>
</div>
</main>
<script>
        // Simple micro-interactions for the sidebar and menu
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('mobile-menu-toggle');
        let menuOpen = false;

        menuToggle.addEventListener('click', () => {
            menuOpen = !menuOpen;
            if (menuOpen) {
                sidebar.classList.remove('-translate-x-full');
            } else {
                sidebar.classList.add('-translate-x-full');
            }
        });

        // Close menu on outside click for mobile
        document.addEventListener('click', (e) => {
            if (menuOpen && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                menuOpen = false;
                sidebar.classList.add('-translate-x-full');
            }
        });

        // Dashboard Metric Animations
        const counters = document.querySelectorAll('h4');
        counters.forEach(counter => {
            const finalValue = counter.innerText.replace(/[^0-9.]/g, '');
            if (!isNaN(finalValue) && finalValue !== "") {
                let start = 0;
                const duration = 1000;
                const stepTime = 20;
                const increment = finalValue / (duration / stepTime);
                
                const timer = setInterval(() => {
                    start += increment;
                    if (start >= finalValue) {
                        counter.innerText = counter.innerText.includes('$') ? '$' + parseFloat(finalValue).toLocaleString() : parseInt(finalValue).toLocaleString();
                        clearInterval(timer);
                    } else {
                        counter.innerText = counter.innerText.includes('$') ? '$' + Math.floor(start).toLocaleString() : Math.floor(start).toLocaleString();
                    }
                }, stepTime);
            }
        });
    </script>
</body></html>

<!-- Shops - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Shops | Kambuja Platform</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Google Fonts: Inter & Hanken Grotesk -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-fixed": "#1b1b1b",
                    "inverse-on-surface": "#f0f1f2",
                    "surface-container": "#edeeef",
                    "primary-fixed-dim": "#c6c6c6",
                    "tertiary": "#000000",
                    "secondary-fixed-dim": "#c0c1ff",
                    "on-surface-variant": "#4c4546",
                    "on-surface": "#191c1d",
                    "error-container": "#ffdad6",
                    "tertiary-container": "#1b1b1b",
                    "surface-variant": "#e1e3e4",
                    "background": "#f8f9fa",
                    "surface-container-low": "#f3f4f5",
                    "surface": "#f8f9fa",
                    "on-secondary-fixed": "#07006c",
                    "surface-container-highest": "#e1e3e4",
                    "surface-bright": "#f8f9fa",
                    "primary-container": "#1b1b1b",
                    "on-tertiary-fixed-variant": "#474747",
                    "on-tertiary-container": "#848484",
                    "inverse-surface": "#2e3132",
                    "on-error-container": "#93000a",
                    "on-tertiary": "#ffffff",
                    "secondary-container": "#6063ee",
                    "tertiary-fixed-dim": "#c6c6c6",
                    "tertiary-fixed": "#e2e2e2",
                    "surface-container-high": "#e7e8e9",
                    "on-background": "#191c1d",
                    "on-primary-fixed-variant": "#474747",
                    "surface-tint": "#5e5e5e",
                    "on-secondary-container": "#fffbff",
                    "primary-fixed": "#e2e2e2",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "outline": "#7e7576",
                    "on-primary-container": "#848484",
                    "surface-container-lowest": "#ffffff",
                    "primary": "#000000",
                    "secondary": "#4648d4",
                    "error": "#ba1a1a",
                    "secondary-fixed": "#e1e0ff",
                    "on-primary-fixed": "#1b1b1b",
                    "outline-variant": "#cfc4c5",
                    "on-secondary-fixed-variant": "#2f2ebe",
                    "on-secondary": "#ffffff",
                    "surface-dim": "#d9dadb",
                    "inverse-primary": "#c6c6c6"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-mobile": "16px",
                    "stack-lg": "32px",
                    "sidebar-width": "260px",
                    "stack-sm": "8px",
                    "stack-md": "16px",
                    "container-max": "1200px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "headline-md-mobile": ["Hanken Grotesk"],
                    "label-caps": ["Inter"],
                    "code-sm": ["Inter"],
                    "headline-md": ["Hanken Grotesk"],
                    "body-md": ["Inter"],
                    "title-sm": ["Inter"],
                    "display-lg": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "headline-md-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                    "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            background-color: #f8f9fa;
        }
        .active-tab {
            background-color: #000000;
            color: #ffffff;
            border-radius: 0.5rem;
        }
        /* Custom scrollbar for data tables */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
    </style>
</head>
<body class="font-body-md text-body-md text-on-surface antialiased">
<!-- Sidebar Navigation Shell -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter transition-transform duration-300 md:translate-x-0 -translate-x-full z-50" id="sidebar">
<div class="mb-stack-lg">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mt-1">Shop Management</p>
</div>
<nav class="flex-grow space-y-1">
<a class="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors group" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-title-sm text-title-sm">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 active-tab shadow-sm transition-all scale-[0.99] duration-150 group" href="#">
<span class="material-symbols-outlined" data-icon="storefront">storefront</span>
<span class="font-title-sm text-title-sm">Shops</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors group" href="#">
<span class="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
<span class="font-title-sm text-title-sm">Admin Accounts</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors group" href="#">
<span class="material-symbols-outlined" data-icon="analytics">analytics</span>
<span class="font-title-sm text-title-sm">Platform Reports</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors group" href="#">
<span class="material-symbols-outlined" data-icon="terminal">terminal</span>
<span class="font-title-sm text-title-sm">System Logs</span>
</a>
</nav>
<div class="mt-auto pt-gutter border-t border-outline-variant">
<a class="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-title-sm text-title-sm">Settings</span>
</a>
</div>
</aside>
<!-- Main Content Wrapper -->
<main class="md:ml-[260px] min-h-screen flex flex-col">
<!-- TopAppBar Header Shell -->
<header class="h-16 flex justify-between items-center px-gutter bg-background border-b border-outline-variant sticky top-0 z-40">
<div class="flex items-center gap-4">
<button class="md:hidden p-2 -ml-2 text-on-surface-variant" id="mobile-toggle">
<span class="material-symbols-outlined" data-icon="menu">menu</span>
</button>
<h2 class="font-headline-md text-headline-md text-primary">Kambuja Platform</h2>
</div>
<div class="flex items-center gap-6">
<div class="hidden md:flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="help">help</span>
</button>
</div>
<div class="flex items-center gap-3 pl-4 border-l border-outline-variant">
<div class="text-right hidden sm:block">
<p class="font-title-sm text-title-sm leading-none">Admin User</p>
<p class="font-label-caps text-[10px] text-on-surface-variant mt-1">SUPER ADMIN</p>
</div>
<img class="w-10 h-10 rounded-full border border-outline-variant object-cover" data-alt="Professional headshot of a corporate administrator in a bright, modern office setting with minimalist decor and soft studio lighting. High contrast black and white aesthetic with sharp focus." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRX-PLX3d6eDQOz4zn7TxG42eIuh4k_BQmnjJ0f9USri_W7uamVk4Xd4eR-VXVgT5h4kxFXAcqMBi0VtaLSupjeETvrBNk6LL_RqX2RKlkGm4AtYESZS5Y48QYMfVMZ99tSfp5FvulT-WmPbyNPYl0NklAeI2B6Wzw6iTUaV9S8HSz1z1xI1urvocI0G6VKf4CKNAxqkKSMZhBD4AfQGUqWrgQV8lAe_eEAYY5Af2nXgcVDwqz_z5AzJEkJXlx5kWCy9kKVvSUAl2l"/>
</div>
</div>
</header>
<!-- Screen Content -->
<div class="p-gutter max-w-container-max w-full mx-auto flex-grow">
<!-- Breadcrumbs & Actions Row -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-stack-lg">
<div>
<h3 class="font-display-lg text-display-lg text-on-surface">Shops</h3>
<p class="text-on-surface-variant mt-1">Manage and monitor all active commercial outlets on the platform.</p>
</div>
<div class="flex items-center gap-stack-md">
<button class="flex items-center gap-2 bg-on-surface text-background px-6 py-2.5 rounded-lg font-title-sm text-title-sm hover:opacity-90 active:scale-[0.98] transition-all">
<span class="material-symbols-outlined text-[20px]" data-icon="add">add</span>
                        Add Shop
                    </button>
</div>
</div>
<!-- Dashboard Stats Preview (Asymmetric Layout) -->
<div class="grid grid-cols-1 lg:grid-cols-4 gap-gutter mb-stack-lg">
<div class="lg:col-span-1 bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-center">
<span class="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL SHOPS</span>
<span class="font-display-lg text-display-lg font-bold">1,248</span>
<div class="flex items-center gap-1 text-green-600 mt-2">
<span class="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
<span class="font-label-caps text-[11px]">+12.5% this month</span>
</div>
</div>
<div class="lg:col-span-1 bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col justify-center">
<span class="font-label-caps text-label-caps text-on-surface-variant mb-2">ACTIVE NOW</span>
<span class="font-display-lg text-display-lg font-bold">982</span>
<div class="flex items-center gap-2 mt-2">
<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
<span class="font-label-caps text-[11px] text-on-surface-variant">Live Traffic</span>
</div>
</div>
<div class="lg:col-span-2 bg-primary text-background p-stack-md rounded-xl flex items-center justify-between overflow-hidden relative group">
<div class="z-10">
<span class="font-label-caps text-label-caps text-primary-fixed opacity-80 mb-2">PLATFORM STATUS</span>
<h4 class="font-headline-md text-headline-md">High-Performing Nodes</h4>
<p class="text-primary-fixed text-[13px] mt-1 max-w-[240px]">All shop synchronization systems are operating within optimal latency parameters.</p>
</div>
<div class="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 group-hover:opacity-30 transition-opacity">

</div>
</div>
</div>
<!-- Advanced Filters Shell -->
<div class="bg-surface-container-low border border-outline-variant rounded-t-xl px-gutter py-4 flex flex-wrap items-center gap-gutter">
<div class="relative flex-grow max-w-md">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Search by name, code or owner..." type="text"/>
</div>
<div class="flex items-center gap-stack-md ml-auto">
<button class="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface-container-lowest font-title-sm text-title-sm rounded-lg hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
                        Filter
                    </button>
<button class="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-surface-container-lowest font-title-sm text-title-sm rounded-lg hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]" data-icon="download">download</span>
                        Export
                    </button>
</div>
</div>
<!-- Shops Data Table Shell -->
<div class="bg-surface-container-lowest border-x border-b border-outline-variant overflow-hidden rounded-b-xl shadow-sm">
<div class="overflow-x-auto">
<table class="w-full border-collapse">
<thead>
<tr class="border-b border-outline-variant bg-surface-container-low">
<th class="text-left px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Name</th>
<th class="text-left px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Code</th>
<th class="text-left px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Owner Admin</th>
<th class="text-left px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Location</th>
<th class="text-left px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Status</th>
<th class="text-right px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Actions</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Shop Entry 1 -->
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-primary group-hover:scale-105 transition-transform">
                                            KP
                                        </div>
<div>
<p class="font-title-sm text-title-sm text-on-surface">Kambuja Prime</p>
<p class="text-[12px] text-on-surface-variant">Retail Hub</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="font-code-sm text-code-sm px-2 py-1 bg-surface-container rounded border border-outline-variant">SHOP-2201</span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="account_circle">account_circle</span>
<span class="font-body-md text-body-md">Pheakdey Khem</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-error text-[18px]" data-icon="location_on">location_on</span>
<span class="font-body-md text-body-md">Phnom Penh</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-green-500"></span>
<span class="font-label-caps text-[11px] text-on-surface">ACTIVE</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<!-- Shop Entry 2 -->
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-primary group-hover:scale-105 transition-transform">
                                            AS
                                        </div>
<div>
<p class="font-title-sm text-title-sm text-on-surface">Angkor Spirits</p>
<p class="text-[12px] text-on-surface-variant">Beverage Supply</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="font-code-sm text-code-sm px-2 py-1 bg-surface-container rounded border border-outline-variant">SHOP-5582</span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="account_circle">account_circle</span>
<span class="font-body-md text-body-md">Sophea Chan</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-error text-[18px]" data-icon="location_on">location_on</span>
<span class="font-body-md text-body-md">Siem Reap</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-green-500"></span>
<span class="font-label-caps text-[11px] text-on-surface">ACTIVE</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<!-- Shop Entry 3 (Maintenance) -->
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4 opacity-70">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-primary group-hover:scale-105 transition-transform">
                                            MT
                                        </div>
<div>
<p class="font-title-sm text-title-sm text-on-surface">Mekong Tech</p>
<p class="text-[12px] text-on-surface-variant">Electronics</p>
</div>
</div>
</td>
<td class="px-6 py-4 opacity-70">
<span class="font-code-sm text-code-sm px-2 py-1 bg-surface-container rounded border border-outline-variant">SHOP-8843</span>
</td>
<td class="px-6 py-4 opacity-70">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="account_circle">account_circle</span>
<span class="font-body-md text-body-md">Vannak Ly</span>
</div>
</td>
<td class="px-6 py-4 opacity-70">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-error text-[18px]" data-icon="location_on">location_on</span>
<span class="font-body-md text-body-md">Battambang</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-yellow-500"></span>
<span class="font-label-caps text-[11px] text-on-surface">MAINTENANCE</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<!-- Shop Entry 4 -->
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center font-bold text-primary group-hover:scale-105 transition-transform">
                                            ST
                                        </div>
<div>
<p class="font-title-sm text-title-sm text-on-surface">Silver Textiles</p>
<p class="text-[12px] text-on-surface-variant">Garment Industry</p>
</div>
</div>
</td>
<td class="px-6 py-4">
<span class="font-code-sm text-code-sm px-2 py-1 bg-surface-container rounded border border-outline-variant">SHOP-1192</span>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-on-surface-variant text-[18px]" data-icon="account_circle">account_circle</span>
<span class="font-body-md text-body-md">Chea Boran</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-error text-[18px]" data-icon="location_on">location_on</span>
<span class="font-body-md text-body-md">Kampot</span>
</div>
</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-green-500"></span>
<span class="font-label-caps text-[11px] text-on-surface">ACTIVE</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Footer -->
<div class="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
<p class="font-body-md text-body-md text-on-surface-variant">Showing 1 to 4 of 1,248 entries</p>
<div class="flex items-center gap-2">
<button class="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest disabled:opacity-50 hover:bg-surface-container transition-colors" disabled="">
<span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button class="px-3 py-1 bg-on-surface text-background rounded-lg font-title-sm text-title-sm">1</button>
<button class="px-3 py-1 hover:bg-surface-container transition-colors rounded-lg font-title-sm text-title-sm">2</button>
<button class="px-3 py-1 hover:bg-surface-container transition-colors rounded-lg font-title-sm text-title-sm">3</button>
<span class="px-2">...</span>
<button class="px-3 py-1 hover:bg-surface-container transition-colors rounded-lg font-title-sm text-title-sm">312</button>
<button class="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Contextual Help Card -->
<div class="mt-stack-lg p-gutter bg-surface-container-highest rounded-xl border border-outline-variant flex items-start gap-4">
<span class="material-symbols-outlined text-primary text-[32px]" data-icon="info">info</span>
<div>
<h5 class="font-title-sm text-title-sm mb-1">Administrative Guidelines</h5>
<p class="text-on-surface-variant text-[13px] leading-relaxed max-w-2xl">
                        Remember to verify ownership documents before approving a new shop. Active status allows the shop to process transactions and appear in global search results. Shops in maintenance are hidden from the public interface but remain accessible to managers.
                    </p>
</div>
</div>
</div>
<!-- Subtle Footer -->
<footer class="mt-auto px-gutter py-6 border-t border-outline-variant flex justify-between items-center text-on-surface-variant font-label-caps text-[10px]">
<span>© 2024 KAMBUJA PLATFORM — SYSTEM VERSION 4.2.1-STABLE</span>
<div class="flex gap-4">
<a class="hover:text-primary transition-colors" href="#">SECURITY AUDIT</a>
<a class="hover:text-primary transition-colors" href="#">DATA COMPLIANCE</a>
<a class="hover:text-primary transition-colors" href="#">SUPPORT HUB</a>
</div>
</footer>
</main>
<!-- Scripts for UI Interactions -->
<script>
        // Sidebar Toggle for Mobile
        const sidebar = document.getElementById('sidebar');
        const mobileToggle = document.getElementById('mobile-toggle');
        
        mobileToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });

        // Click outside to close sidebar on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.add('-translate-x-full');
            }
        });

        // Simulating Table Hover Interaction Logic
        const tableRows = document.querySelectorAll('tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'translateX(4px)';
                row.style.transition = 'transform 0.2s ease-out';
            });
            row.addEventListener('mouseleave', () => {
                row.style.transform = 'translateX(0px)';
            });
        });
    </script>
</body></html>

<!-- Admin Accounts - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Admin Accounts | Kambuja Platform</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Hanken+Grotesk:wght@600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-fixed": "#1b1b1b",
                    "inverse-on-surface": "#f0f1f2",
                    "surface-container": "#edeeef",
                    "primary-fixed-dim": "#c6c6c6",
                    "tertiary": "#000000",
                    "secondary-fixed-dim": "#c0c1ff",
                    "on-surface-variant": "#4c4546",
                    "on-surface": "#191c1d",
                    "error-container": "#ffdad6",
                    "tertiary-container": "#1b1b1b",
                    "surface-variant": "#e1e3e4",
                    "background": "#f8f9fa",
                    "surface-container-low": "#f3f4f5",
                    "surface": "#f8f9fa",
                    "on-secondary-fixed": "#07006c",
                    "surface-container-highest": "#e1e3e4",
                    "surface-bright": "#f8f9fa",
                    "primary-container": "#1b1b1b",
                    "on-tertiary-fixed-variant": "#474747",
                    "on-tertiary-container": "#848484",
                    "inverse-surface": "#2e3132",
                    "on-error-container": "#93000a",
                    "on-tertiary": "#ffffff",
                    "secondary-container": "#6063ee",
                    "tertiary-fixed-dim": "#c6c6c6",
                    "tertiary-fixed": "#e2e2e2",
                    "surface-container-high": "#e7e8e9",
                    "on-background": "#191c1d",
                    "on-primary-fixed-variant": "#474747",
                    "surface-tint": "#5e5e5e",
                    "on-secondary-container": "#fffbff",
                    "primary-fixed": "#e2e2e2",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "outline": "#7e7576",
                    "on-primary-container": "#848484",
                    "surface-container-lowest": "#ffffff",
                    "primary": "#000000",
                    "secondary": "#4648d4",
                    "error": "#ba1a1a",
                    "secondary-fixed": "#e1e0ff",
                    "on-primary-fixed": "#1b1b1b",
                    "outline-variant": "#cfc4c5",
                    "on-secondary-fixed-variant": "#2f2ebe",
                    "on-secondary": "#ffffff",
                    "surface-dim": "#d9dadb",
                    "inverse-primary": "#c6c6c6"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-mobile": "16px",
                    "stack-lg": "32px",
                    "sidebar-width": "260px",
                    "stack-sm": "8px",
                    "stack-md": "16px",
                    "container-max": "1200px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "headline-md-mobile": ["Hanken Grotesk"],
                    "label-caps": ["Inter"],
                    "code-sm": ["Inter"],
                    "headline-md": ["Hanken Grotesk"],
                    "body-md": ["Inter"],
                    "title-sm": ["Inter"],
                    "display-lg": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "headline-md-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                    "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e1e3e4;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background text-on-surface">
<!-- Sidebar Navigation -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter z-50">
<div class="mb-stack-lg">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="font-body-md text-on-surface-variant text-[12px] opacity-70">Shop Management</p>
</div>
<nav class="flex-1 space-y-2">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-body-md text-body-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined">storefront</span>
<span class="font-body-md text-body-md">Shops</span>
</a>
<!-- Active State -->
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-xl transition-transform duration-150 active:scale-[0.99]" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">manage_accounts</span>
<span class="font-body-md text-body-md font-semibold">Admin Accounts</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="font-body-md text-body-md">Platform Reports</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined">terminal</span>
<span class="font-body-md text-body-md">System Logs</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group mt-auto" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-md text-body-md">Settings</span>
</a>
</nav>
<div class="mt-auto pt-6 border-t border-outline-variant flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant">
<img class="w-full h-full object-cover" data-alt="A clean, minimalist studio portrait of a professional corporate administrator against a neutral grey background. The lighting is soft and high-key, reflecting a sophisticated and authoritative brand persona. The individual has a friendly but focused expression, suitable for a high-end enterprise management platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8vGe4bEZLKmyacOsqHdIs8jNzUymVR9sZ0z-biP6K4pA5VYzv_4hYilyzzIPb0OcoAaewgSMnSIE-oC8NqqrBfRP_NxcFunkl-PF1xViE8zPVbZBgAQmTRQCRmFNapoWKJI6fLGqAfOgUtGCV2-H7yxyElpkV_-2ipvhhP8NJpHouENxq_DkjE9ITB_WMyRfACgW5JHIPEeAK-t83NfQvCv6URHbR0e2GX8akYi7Rbc6Jx1qNB0beWGEiAY25Y8nmMiK3QtfZN-3Q"/>
</div>
<div class="flex-1 overflow-hidden">
<p class="font-title-sm text-title-sm truncate">Sokha Meas</p>
<p class="font-code-sm text-on-surface-variant opacity-60 truncate">Root Administrator</p>
</div>
</div>
</aside>
<!-- Main Content Shell -->
<main class="ml-[260px] min-h-screen flex flex-col">
<!-- Top App Bar -->
<header class="h-16 px-gutter flex justify-between items-center bg-background border-b border-outline-variant sticky top-0 z-40">
<h2 class="font-headline-md text-headline-md text-primary">Kambuja Platform</h2>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
</div>
<div class="h-8 w-[1px] bg-outline-variant"></div>
<button class="flex items-center gap-2 group">
<span class="font-label-caps text-label-caps text-on-surface-variant group-hover:text-primary">ADMIN PANEL</span>
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[20px]">keyboard_arrow_down</span>
</button>
</div>
</header>
<!-- Canvas Area -->
<div class="flex-1 p-gutter max-w-[1200px] w-full mx-auto">
<!-- Page Header Actions -->
<div class="flex justify-between items-end mb-stack-lg">
<div>
<h3 class="font-headline-md text-headline-md mb-1">Admin Accounts</h3>
<p class="font-body-md text-on-surface-variant">Manage security permissions and access for platform controllers.</p>
</div>
<button class="bg-primary text-on-primary px-6 py-3 rounded-xl font-title-sm flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
<span class="material-symbols-outlined text-[20px]">person_add</span>
<span>Add Admin</span>
</button>
</div>
<!-- Bento Filter Bar -->
<div class="grid grid-cols-12 gap-stack-md mb-stack-lg">
<div class="col-span-12 md:col-span-5 bg-white border border-outline-variant rounded-xl p-4 flex items-center gap-3">
<span class="material-symbols-outlined text-on-surface-variant">search</span>
<input class="bg-transparent border-none focus:ring-0 w-full font-body-md placeholder:text-on-surface-variant/50" placeholder="Search by username or email..." type="text"/>
</div>
<div class="col-span-6 md:col-span-3 bg-white border border-outline-variant rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-on-surface-variant">filter_list</span>
<span class="font-body-md">Status: All</span>
</div>
<span class="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
<div class="col-span-6 md:col-span-4 bg-white border border-outline-variant rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-on-surface-variant">home_work</span>
<span class="font-body-md">Assigned Shop: Any</span>
</div>
<span class="material-symbols-outlined text-on-surface-variant">expand_more</span>
</div>
</div>
<!-- Data Table Card -->
<div class="bg-white border border-outline-variant rounded-xl overflow-hidden">
<div class="overflow-x-auto custom-scrollbar">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant">
<th class="p-6 font-label-caps text-label-caps text-on-surface-variant">USERNAME</th>
<th class="p-6 font-label-caps text-label-caps text-on-surface-variant">EMAIL</th>
<th class="p-6 font-label-caps text-label-caps text-on-surface-variant">ASSIGNED SHOP</th>
<th class="p-6 font-label-caps text-label-caps text-on-surface-variant">STATUS</th>
<th class="p-6 font-label-caps text-label-caps text-on-surface-variant text-right">ACTIONS</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Row 1 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="p-6">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-[12px]">JD</div>
<span class="font-title-sm">john_admin</span>
</div>
</td>
<td class="p-6 font-body-md text-on-surface-variant">john.doe@kambuja.com</td>
<td class="p-6">
<div class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-sm border border-outline-variant">
                                        Central Market Branch
                                    </div>
</td>
<td class="p-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="font-body-md font-semibold">Active</span>
</div>
</td>
<td class="p-6 text-right">
<button class="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
</button>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="p-6">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-[12px]">SC</div>
<span class="font-title-sm">srey_chan</span>
</div>
</td>
<td class="p-6 font-body-md text-on-surface-variant">chan.s@kambuja.com</td>
<td class="p-6">
<div class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-sm border border-outline-variant">
                                        Siem Reap Boutique
                                    </div>
</td>
<td class="p-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="font-body-md font-semibold">Active</span>
</div>
</td>
<td class="p-6 text-right">
<button class="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
</button>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="p-6">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-[12px]">KL</div>
<span class="font-title-sm">k_lek</span>
</div>
</td>
<td class="p-6 font-body-md text-on-surface-variant">lek.kim@kambuja.com</td>
<td class="p-6 text-on-surface-variant italic">
<span class="font-code-sm">Platform Wide</span>
</td>
<td class="p-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-error"></div>
<span class="font-body-md font-semibold text-error">Suspended</span>
</div>
</td>
<td class="p-6 text-right">
<button class="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
</button>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="p-6">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-[12px]">PT</div>
<span class="font-title-sm">piseth_t</span>
</div>
</td>
<td class="p-6 font-body-md text-on-surface-variant">piseth.t@kambuja.com</td>
<td class="p-6">
<div class="inline-flex items-center px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-code-sm border border-outline-variant">
                                        Riverside Outlet
                                    </div>
</td>
<td class="p-6">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-yellow-400"></div>
<span class="font-body-md font-semibold">Pending</span>
</div>
</td>
<td class="p-6 text-right">
<button class="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Empty State (Hidden in this demo but logic kept) -->
<div class="hidden flex flex-col items-center justify-center py-20 bg-white">
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
<span class="material-symbols-outlined text-on-surface-variant text-[32px]">manage_accounts</span>
</div>
<p class="font-title-sm text-title-sm">No admins found</p>
<p class="font-body-md text-on-surface-variant mb-6 text-center max-w-[300px]">You haven't added any administrators yet. Get started by clicking 'Add Admin'.</p>
<button class="secondary-button text-primary px-4 py-2 border border-primary rounded-lg font-semibold hover:bg-surface-container transition-colors">
                        Add your first admin
                    </button>
</div>
<!-- Pagination -->
<div class="p-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
<span class="font-body-md text-on-surface-variant">Showing 1-4 of 12 admins</span>
<div class="flex items-center gap-2">
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white disabled:opacity-30" disabled="">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-primary text-on-primary">1</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white hover:bg-surface-container-high">2</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white hover:bg-surface-container-high">3</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant bg-white">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<!-- Footer Info -->
<footer class="mt-auto py-8 px-gutter flex justify-between items-center border-t border-outline-variant/30">
<p class="font-code-sm text-on-surface-variant opacity-50">© 2024 Kambuja Platform v1.0.4 - Secure Instance</p>
<div class="flex items-center gap-4">
<a class="font-code-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
<span class="w-1 h-1 bg-outline-variant rounded-full"></span>
<a class="font-code-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
</div>
</footer>
</main>
<script>
        // Simple Micro-interactions
        document.querySelectorAll('tr').forEach(row => {
            row.addEventListener('mousedown', function() {
                this.classList.add('scale-[0.998]');
            });
            row.addEventListener('mouseup', function() {
                this.classList.remove('scale-[0.998]');
            });
        });

        // Search highlight effect
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('border-primary');
            searchInput.parentElement.classList.add('ring-2');
            searchInput.parentElement.classList.add('ring-surface-container-high');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('border-primary');
            searchInput.parentElement.classList.remove('ring-2');
            searchInput.parentElement.classList.remove('ring-surface-container-high');
        });
    </script>
</body></html>

<!-- Create Admin - Kambuja Platform -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Create Admin - Kambuja Platform</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
        }
        .sidebar-active {
            background-color: #000000;
            color: #ffffff;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-tertiary-fixed": "#1b1b1b",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container": "#edeeef",
                        "primary-fixed-dim": "#c6c6c6",
                        "tertiary": "#000000",
                        "secondary-fixed-dim": "#c0c1ff",
                        "on-surface-variant": "#4c4546",
                        "on-surface": "#191c1d",
                        "error-container": "#ffdad6",
                        "tertiary-container": "#1b1b1b",
                        "surface-variant": "#e1e3e4",
                        "background": "#f8f9fa",
                        "surface-container-low": "#f3f4f5",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#07006c",
                        "surface-container-highest": "#e1e3e4",
                        "surface-bright": "#f8f9fa",
                        "primary-container": "#1b1b1b",
                        "on-tertiary-fixed-variant": "#474747",
                        "on-tertiary-container": "#848484",
                        "inverse-surface": "#2e3132",
                        "on-error-container": "#93000a",
                        "on-tertiary": "#ffffff",
                        "secondary-container": "#6063ee",
                        "tertiary-fixed-dim": "#c6c6c6",
                        "tertiary-fixed": "#e2e2e2",
                        "surface-container-high": "#e7e8e9",
                        "on-background": "#191c1d",
                        "on-primary-fixed-variant": "#474747",
                        "surface-tint": "#5e5e5e",
                        "on-secondary-container": "#fffbff",
                        "primary-fixed": "#e2e2e2",
                        "on-error": "#ffffff",
                        "on-primary": "#ffffff",
                        "outline": "#7e7576",
                        "on-primary-container": "#848484",
                        "surface-container-lowest": "#ffffff",
                        "primary": "#000000",
                        "secondary": "#4648d4",
                        "error": "#ba1a1a",
                        "secondary-fixed": "#e1e0ff",
                        "on-primary-fixed": "#1b1b1b",
                        "outline-variant": "#cfc4c5",
                        "on-secondary-fixed-variant": "#2f2ebe",
                        "on-secondary": "#ffffff",
                        "surface-dim": "#d9dadb",
                        "inverse-primary": "#c6c6c6"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "margin-mobile": "16px",
                        "stack-lg": "32px",
                        "sidebar-width": "260px",
                        "stack-sm": "8px",
                        "stack-md": "16px",
                        "container-max": "1200px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "headline-md": ["Hanken Grotesk"],
                        "label-caps": ["Inter"],
                        "code-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "title-sm": ["Inter"],
                        "display-lg": ["Hanken Grotesk"]
                    },
                    "fontSize": {
                        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                        "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                        "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
                    }
                },
            },
        }
    </script>
</head>
<body class="bg-background text-on-surface">
<!-- Sidebar Navigation Shell -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-6 z-50">
<div class="mb-10">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="font-body-md text-on-surface-variant text-[12px] -mt-1">Shop Management</p>
</div>
<nav class="flex-1 space-y-2">
<!-- Dashboard -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">dashboard</span>
<span class="font-body-md">Dashboard</span>
</a>
<!-- Shops -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">storefront</span>
<span class="font-body-md">Shops</span>
</a>
<!-- Admin Accounts (Active State) -->
<a class="flex items-center gap-3 px-3 py-2 bg-primary text-on-primary rounded-xl transition-transform active:scale-[0.99] duration-150" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">manage_accounts</span>
<span class="font-body-md">Admin Accounts</span>
</a>
<!-- Platform Reports -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">analytics</span>
<span class="font-body-md">Platform Reports</span>
</a>
<!-- System Logs -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">terminal</span>
<span class="font-body-md">System Logs</span>
</a>
<!-- Settings -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined group-hover:text-primary">settings</span>
<span class="font-body-md">Settings</span>
</a>
</nav>
</aside>
<!-- Main Content Area -->
<main class="ml-[260px] min-h-screen flex flex-col">
<!-- Top App Bar Shell -->
<header class="flex justify-between items-center h-16 px-gutter bg-background border-b border-outline-variant">
<h2 class="font-headline-md text-headline-md text-primary">Kambuja Platform</h2>
<div class="flex items-center gap-6">
<div class="flex gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
</div>
<div class="flex items-center gap-3 border-l border-outline-variant pl-6">
<div class="text-right">
<p class="font-title-sm text-[14px]">Admin User</p>
<p class="text-[12px] text-on-surface-variant">System Manager</p>
</div>
<div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
<img class="w-full h-full object-cover" data-alt="A professional headshot of a business executive in a high-key, minimalist studio setting. The subject wears a sharp black blazer against a clean white background. Soft, diffused lighting creates a clean, corporate aesthetic that emphasizes clarity and authority, fitting for a premium shop management platform dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhCQQkPxPD0G9H2_ggihzeV-1i4HtHxvmrjTQP-cHoaiGl8X2R2dVCZcA0bArnLQMBdco5zumFEyrDi6U7drrtztTtd93uBqDvyx7WgX4TQZ_V4T1TtGrM7tmlXXVFvARmDWl3yTdU4A6m24P1OEDjkOB51vZVW5DIHRoKbIUAm0Bo6XqHeAnVTsQMIGeNnJ5w6akRe2BZaxxWYVve6kKOlznl48lHX9qxl2pq_oZo9XsVT-LnsffZBrfcxC-kMPUY7pKvKolLEdXc"/>
</div>
</div>
</div>
</header>
<!-- Content Canvas -->
<div class="flex-1 p-gutter max-w-container-max mx-auto w-full">
<!-- Breadcrumbs -->
<nav class="flex items-center gap-2 text-on-surface-variant font-body-md mb-6">
<a class="hover:text-primary" href="#">Admins</a>
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
<span class="text-on-surface font-semibold">Create Admin</span>
</nav>
<div class="mb-10">
<h1 class="font-headline-md text-headline-md mb-2">Create Admin</h1>
<p class="text-on-surface-variant font-body-md">Register a new administrative account for the Kambuja ecosystem.</p>
</div>
<!-- Bento Layout Form Container -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
<!-- Main Form Card -->
<div class="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-8 space-y-8">
<div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
<!-- Username -->
<div class="flex flex-col gap-2">
<label class="font-label-caps text-label-caps text-on-surface-variant">USERNAME</label>
<input class="w-full h-12 bg-white border border-outline rounded px-4 font-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="e.g. jdoe_admin" type="text"/>
</div>
<!-- Email -->
<div class="flex flex-col gap-2">
<label class="font-label-caps text-label-caps text-on-surface-variant">EMAIL ADDRESS</label>
<input class="w-full h-12 bg-white border border-outline rounded px-4 font-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="admin@kambuja.com" type="email"/>
</div>
<!-- Password -->
<div class="flex flex-col gap-2">
<label class="font-label-caps text-label-caps text-on-surface-variant">PASSWORD</label>
<div class="relative">
<input class="w-full h-12 bg-white border border-outline rounded px-4 font-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="••••••••" type="password"/>
<button class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined text-[20px]">visibility</span>
</button>
</div>
</div>
<!-- Shop Selection -->
<div class="flex flex-col gap-2">
<label class="font-label-caps text-label-caps text-on-surface-variant">ASSIGN SHOP (OPTIONAL)</label>
<div class="relative">
<select class="w-full h-12 bg-white border border-outline rounded px-4 font-body-md appearance-none focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none">
<option>Unassigned admin</option>
<option>Angkor Souvenirs</option>
<option>Phnom Penh Textiles</option>
<option>Siem Reap Crafts</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
</div>
<p class="font-code-sm text-code-sm text-on-surface-variant opacity-70">Admins can be selected as a new shop owner later.</p>
</div>
</div>
<!-- Actions -->
<div class="pt-6 border-t border-outline-variant flex justify-end items-center gap-4">
<button class="px-6 py-2.5 font-title-sm text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
                            Cancel
                        </button>
<button class="px-8 py-2.5 bg-primary text-on-primary font-title-sm rounded-lg hover:opacity-90 active:scale-[0.98] transition-all">
                            Save Admin Account
                        </button>
</div>
</div>
<!-- Info Sidebar / Guidance Card -->
<div class="lg:col-span-4 space-y-6">
<div class="bg-surface-container-low border border-outline-variant rounded-xl p-6">
<h3 class="font-title-sm text-title-sm mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">info</span>
                            Role Permissions
                        </h3>
<p class="font-body-md text-on-surface-variant text-[13px] leading-relaxed mb-4">
                            New administrators are granted standard system access. Specific module permissions can be adjusted in the "Settings" tab after account creation.
                        </p>
<ul class="space-y-3">
<li class="flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
<span class="font-body-md text-[13px]">View shop analytics</span>
</li>
<li class="flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
<span class="font-body-md text-[13px]">Manage shop inventory</span>
</li>
<li class="flex items-start gap-3">
<span class="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
<span class="font-body-md text-[13px]">Generate platform reports</span>
</li>
</ul>
</div>
<!-- Visual Context Image -->
<div class="rounded-xl overflow-hidden border border-outline-variant h-48 relative">
<img class="w-full h-full object-cover" data-alt="A macro close-up of a high-end, obsidian-finished keyboard and a sleek modern stylus on a dark desk. Soft morning light catches the metallic edges of the professional gear. The composition is minimalist and high-contrast, featuring deep blacks and crisp highlights that evoke a sense of precision, technical rigor, and administrative mastery in a corporate tech environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKvZQQ27SLVo5gF7-m490C0z6pwiONP2KZiGUc9QrlgcJ9yEsuqu8LBTxAFKIiXWUGhddJOSS7DNVZ_NmLsbnLQFcrcpdToLswJfsjGxyhRqZMpZ6-a9yF4l3WFshbKbju6NwEaxhNv19ss5Zh-uyDRJbh2tVyzlXfAi-o9OEGZHk5HCddnyKhm-o0RCcV5GnpVsYLHIKKlI0AaW3Gd7s9YkpbkNkKlci6_TLgstzOCRo1YFN78gG98LQ0sdCFF0VXU2cYp_Yq6DYU"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
<p class="text-white font-code-sm text-[11px] opacity-90 uppercase tracking-widest">Authorized Access Only</p>
</div>
</div>
</div>
</div>
</div>
</main>
<script>
        // Micro-interactions for form focus states
        document.querySelectorAll('input, select').forEach(element => {
            element.addEventListener('focus', () => {
                element.parentElement.querySelector('label')?.classList.add('text-primary');
            });
            element.addEventListener('blur', () => {
                element.parentElement.querySelector('label')?.classList.remove('text-primary');
            });
        });
    </script>
</body></html>

<!-- Platform Reports - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kambuja Platform - Platform Reports</title>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Google Fonts: Inter & Hanken Grotesk -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-tertiary-fixed": "#1b1b1b",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container": "#edeeef",
                        "primary-fixed-dim": "#c6c6c6",
                        "tertiary": "#000000",
                        "secondary-fixed-dim": "#c0c1ff",
                        "on-surface-variant": "#4c4546",
                        "on-surface": "#191c1d",
                        "error-container": "#ffdad6",
                        "tertiary-container": "#1b1b1b",
                        "surface-variant": "#e1e3e4",
                        "background": "#f8f9fa",
                        "surface-container-low": "#f3f4f5",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#07006c",
                        "surface-container-highest": "#e1e3e4",
                        "surface-bright": "#f8f9fa",
                        "primary-container": "#1b1b1b",
                        "on-tertiary-fixed-variant": "#474747",
                        "on-tertiary-container": "#848484",
                        "inverse-surface": "#2e3132",
                        "on-error-container": "#93000a",
                        "on-tertiary": "#ffffff",
                        "secondary-container": "#6063ee",
                        "tertiary-fixed-dim": "#c6c6c6",
                        "tertiary-fixed": "#e2e2e2",
                        "surface-container-high": "#e7e8e9",
                        "on-background": "#191c1d",
                        "on-primary-fixed-variant": "#474747",
                        "surface-tint": "#5e5e5e",
                        "on-secondary-container": "#fffbff",
                        "primary-fixed": "#e2e2e2",
                        "on-error": "#ffffff",
                        "on-primary": "#ffffff",
                        "outline": "#7e7576",
                        "on-primary-container": "#848484",
                        "surface-container-lowest": "#ffffff",
                        "primary": "#000000",
                        "secondary": "#4648d4",
                        "error": "#ba1a1a",
                        "secondary-fixed": "#e1e0ff",
                        "on-primary-fixed": "#1b1b1b",
                        "outline-variant": "#cfc4c5",
                        "on-secondary-fixed-variant": "#2f2ebe",
                        "on-secondary": "#ffffff",
                        "surface-dim": "#d9dadb",
                        "inverse-primary": "#c6c6c6"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "margin-mobile": "16px",
                        "stack-lg": "32px",
                        "sidebar-width": "260px",
                        "stack-sm": "8px",
                        "stack-md": "16px",
                        "container-max": "1200px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "headline-md-mobile": ["Hanken Grotesk"],
                        "label-caps": ["Inter"],
                        "code-sm": ["Inter"],
                        "headline-md": ["Hanken Grotesk"],
                        "body-md": ["Inter"],
                        "title-sm": ["Inter"],
                        "display-lg": ["Hanken Grotesk"]
                    },
                    "fontSize": {
                        "headline-md-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "600"}],
                        "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                        "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                        "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                        "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                        "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Hanken Grotesk', sans-serif; }
    </style>
</head>
<body class="bg-background text-on-surface">
<!-- SideNavBar Shell -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter z-50">
<!-- Brand Header -->
<div class="mb-10 px-2">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Shop Management</p>
</div>
<!-- Navigation Links -->
<nav class="flex-grow space-y-2">
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="storefront">storefront</span>
<span>Shops</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="manage_accounts">manage_accounts</span>
<span>Admin Accounts</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary font-body-md text-body-md rounded-xl transition-transform duration-150 active:scale-[0.99]" href="#">
<span class="material-symbols-outlined" data-icon="analytics" style="font-variation-settings: 'FILL' 1;">analytics</span>
<span>Platform Reports</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="terminal">terminal</span>
<span>System Logs</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant font-body-md text-body-md hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span>Settings</span>
</a>
</nav>
<!-- Profile Mini-Card at Bottom -->
<div class="mt-auto pt-6 border-t border-outline-variant flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Professional studio portrait of a shop management executive, minimalist high-key lighting, corporate grey background, clean white collared shirt, modern minimalist aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq5gA4XP1awslOTP0P5D31oUVjcpTIYNZrKU6g36MV7YW1Gdls2ztYIudmVEzJI_ED1xG5-ZvFsQJIGFYXOzwVTjP58iQI2MfQdOLp8V6VuvoMu6o2ii_lCwvNiRVQCC9CwHSjdQOgQUarTgpKXJpk0OQ6-em8qlALbtj1VhnSXfUASasvYqUj9bDyfjeALmjowyqN2XbqEuArjjCZD4BE-Mao-Zs6oRFQid-X72bx-RKrDak3wMs3gUIPL9qWnJT_UPAh4xXokaWC"/>
</div>
<div>
<p class="font-title-sm text-title-sm text-on-surface">Pkay</p>
<p class="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">Platform Admin</p>
</div>
</div>
</aside>
<!-- TopAppBar Shell -->
<header class="ml-[260px] h-16 px-gutter flex justify-between items-center bg-background border-b border-outline-variant fixed top-0 right-0 left-0 z-40">
<h2 class="font-headline-md text-headline-md font-bold text-primary">Kambuja Platform</h2>
<div class="flex items-center gap-6">
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined" data-icon="help">help</span>
</button>
</div>
<div class="h-8 w-[1px] bg-outline-variant"></div>
<div class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
<div class="text-right hidden sm:block">
<p class="font-title-sm text-title-sm text-on-surface leading-tight">Admin Portal</p>
<p class="font-label-caps text-[10px] text-on-surface-variant">v2.4.0-Stable</p>
</div>
<span class="material-symbols-outlined text-on-surface-variant" data-icon="account_circle">account_circle</span>
</div>
</div>
</header>
<!-- Main Content Canvas -->
<main class="ml-[260px] pt-16 min-h-screen bg-background">
<div class="max-w-[1200px] mx-auto p-gutter animate-fade-in">
<!-- Page Header -->
<div class="flex justify-between items-end mb-stack-lg">
<div>
<h3 class="font-display text-display-lg text-on-surface mb-2">Platform Reports</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Comprehensive overview of shop performance and system-wide revenue data.</p>
</div>
<div class="flex gap-stack-sm">
<button class="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-surface-container-high transition-all rounded-lg font-title-sm text-title-sm">
<span class="material-symbols-outlined text-[18px]" data-icon="filter_list">filter_list</span>
                        Filters
                    </button>
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary hover:opacity-90 transition-all rounded-lg font-title-sm text-title-sm">
<span class="material-symbols-outlined text-[18px]" data-icon="download">download</span>
                        Export CSV
                    </button>
</div>
</div>
<!-- Bento Grid Stats -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack-lg">
<div class="bg-white border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
<p class="font-label-caps text-on-surface-variant mb-4">TOTAL REVENUE</p>
<div class="flex items-baseline gap-2">
<h4 class="font-display text-display-lg">$142,380</h4>
<span class="text-green-600 font-bold text-xs flex items-center">
<span class="material-symbols-outlined text-xs" data-icon="arrow_upward">arrow_upward</span>
                            12%
                        </span>
</div>
</div>
<div class="bg-white border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
<p class="font-label-caps text-on-surface-variant mb-4">ACTIVE SHOPS</p>
<h4 class="font-display text-display-lg">842</h4>
</div>
<div class="bg-white border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
<p class="font-label-caps text-on-surface-variant mb-4">AVG. ORDER VALUE</p>
<h4 class="font-display text-display-lg">$68.50</h4>
</div>
<div class="bg-white border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
<p class="font-label-caps text-on-surface-variant mb-4">NEW ACCOUNTS</p>
<h4 class="font-display text-display-lg">24</h4>
</div>
</div>
<!-- Report Table Container -->
<div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
<div class="p-6 border-b border-outline-variant flex justify-between items-center">
<h4 class="font-title-sm text-title-sm text-on-surface">ShopSalesRevenue Overview</h4>
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]" data-icon="search">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:border-primary focus:ring-0 w-64 outline-none transition-all" placeholder="Search shops..." type="text"/>
</div>
</div>
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-low border-b border-outline-variant">
<tr>
<th class="px-6 py-4 font-label-caps text-on-surface-variant">SHOP NAME</th>
<th class="px-6 py-4 font-label-caps text-on-surface-variant">CATEGORY</th>
<th class="px-6 py-4 font-label-caps text-on-surface-variant">TOTAL SALES</th>
<th class="px-6 py-4 font-label-caps text-on-surface-variant">REVENUE (USD)</th>
<th class="px-6 py-4 font-label-caps text-on-surface-variant">STATUS</th>
<th class="px-6 py-4 font-label-caps text-on-surface-variant text-right">ACTIONS</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-xs">EL</div>
<div>
<p class="font-title-sm text-on-surface">Echo Luxe</p>
<p class="text-[11px] text-on-surface-variant">ID: #92031</p>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface-variant">Electronics</td>
<td class="px-6 py-4 font-body-md text-on-surface">1,240</td>
<td class="px-6 py-4 font-body-md font-semibold text-on-surface">$42,100.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="font-body-md text-on-surface">Active</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-xs">NK</div>
<div>
<p class="font-title-sm text-on-surface">Nordic Kitchen</p>
<p class="text-[11px] text-on-surface-variant">ID: #88219</p>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface-variant">Home Decor</td>
<td class="px-6 py-4 font-body-md text-on-surface">850</td>
<td class="px-6 py-4 font-body-md font-semibold text-on-surface">$28,450.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="font-body-md text-on-surface">Active</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-xs">AV</div>
<div>
<p class="font-title-sm text-on-surface">Aura Velum</p>
<p class="text-[11px] text-on-surface-variant">ID: #91004</p>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface-variant">Apparel</td>
<td class="px-6 py-4 font-body-md text-on-surface">2,100</td>
<td class="px-6 py-4 font-body-md font-semibold text-on-surface">$15,900.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-amber-500"></div>
<span class="font-body-md text-on-surface">Pending</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-xs">SP</div>
<div>
<p class="font-title-sm text-on-surface">Sapphire Peak</p>
<p class="text-[11px] text-on-surface-variant">ID: #87221</p>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface-variant">Outdoor</td>
<td class="px-6 py-4 font-body-md text-on-surface">430</td>
<td class="px-6 py-4 font-body-md font-semibold text-on-surface">$12,300.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-green-500"></div>
<span class="font-body-md text-on-surface">Active</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-lowest transition-colors">
<td class="px-6 py-4 flex items-center gap-3">
<div class="w-8 h-8 rounded bg-surface-container flex items-center justify-center font-bold text-xs">VM</div>
<div>
<p class="font-title-sm text-on-surface">Velo Mod</p>
<p class="text-[11px] text-on-surface-variant">ID: #99310</p>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface-variant">Automotive</td>
<td class="px-6 py-4 font-body-md text-on-surface">115</td>
<td class="px-6 py-4 font-body-md font-semibold text-on-surface">$9,200.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-2 h-2 rounded-full bg-red-500"></div>
<span class="font-body-md text-on-surface">Suspended</span>
</div>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
<!-- Table Footer / Pagination -->
<div class="p-6 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
<p class="font-body-md text-on-surface-variant">Showing 5 of 842 shops</p>
<div class="flex gap-2">
<button class="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-white transition-colors disabled:opacity-50" disabled="">
<span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button class="w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-lg">1</button>
<button class="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-white transition-colors">2</button>
<button class="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-white transition-colors">3</button>
<button class="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg hover:bg-white transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Empty State Contextual Hint (as per user screenshot request) -->
<div class="mt-stack-lg p-stack-lg border border-dashed border-outline rounded-lg text-center bg-surface-container-low">
<span class="material-symbols-outlined text-outline-variant text-[48px] mb-4" data-icon="cloud_off">cloud_off</span>
<h5 class="font-title-sm text-on-surface">Custom Reports Terminal</h5>
<p class="font-body-md text-on-surface-variant max-w-md mx-auto mt-2">To generate deep-dive temporal reports, select specific shops from the directory or use the automated scheduling tool in Settings.</p>
<button class="mt-6 font-label-caps text-primary border-b-2 border-primary pb-1 hover:opacity-70 transition-opacity">LEARN MORE ABOUT AGGREGATION</button>
</div>
</div>
</main>
<!-- Micro-interaction Script -->
<script>
        document.addEventListener('DOMContentLoaded', () => {
            // Simple row highlight interaction
            const rows = document.querySelectorAll('tbody tr');
            rows.forEach(row => {
                row.addEventListener('click', () => {
                    rows.forEach(r => r.classList.remove('bg-surface-container-low'));
                    row.classList.add('bg-surface-container-low');
                });
            });

            // Smooth fade-in animation
            const main = document.querySelector('main');
            main.style.opacity = '0';
            setTimeout(() => {
                main.style.transition = 'opacity 0.6s ease-out';
                main.style.opacity = '1';
            }, 50);
        });
    </script>
</body></html>

<!-- System Logs - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kambuja Platform - System Logs</title>
<!-- Google Fonts: Hanken Grotesk & Inter -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols Outlined -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-tertiary-fixed": "#1b1b1b",
                    "inverse-on-surface": "#f0f1f2",
                    "surface-container": "#edeeef",
                    "primary-fixed-dim": "#c6c6c6",
                    "tertiary": "#000000",
                    "secondary-fixed-dim": "#c0c1ff",
                    "on-surface-variant": "#4c4546",
                    "on-surface": "#191c1d",
                    "error-container": "#ffdad6",
                    "tertiary-container": "#1b1b1b",
                    "surface-variant": "#e1e3e4",
                    "background": "#f8f9fa",
                    "surface-container-low": "#f3f4f5",
                    "surface": "#f8f9fa",
                    "on-secondary-fixed": "#07006c",
                    "surface-container-highest": "#e1e3e4",
                    "surface-bright": "#f8f9fa",
                    "primary-container": "#1b1b1b",
                    "on-tertiary-fixed-variant": "#474747",
                    "on-tertiary-container": "#848484",
                    "inverse-surface": "#2e3132",
                    "on-error-container": "#93000a",
                    "on-tertiary": "#ffffff",
                    "secondary-container": "#6063ee",
                    "tertiary-fixed-dim": "#c6c6c6",
                    "tertiary-fixed": "#e2e2e2",
                    "surface-container-high": "#e7e8e9",
                    "on-background": "#191c1d",
                    "on-primary-fixed-variant": "#474747",
                    "surface-tint": "#5e5e5e",
                    "on-secondary-container": "#fffbff",
                    "primary-fixed": "#e2e2e2",
                    "on-error": "#ffffff",
                    "on-primary": "#ffffff",
                    "outline": "#7e7576",
                    "on-primary-container": "#848484",
                    "surface-container-lowest": "#ffffff",
                    "primary": "#000000",
                    "secondary": "#4648d4",
                    "error": "#ba1a1a",
                    "secondary-fixed": "#e1e0ff",
                    "on-primary-fixed": "#1b1b1b",
                    "outline-variant": "#cfc4c5",
                    "on-secondary-fixed-variant": "#2f2ebe",
                    "on-secondary": "#ffffff",
                    "surface-dim": "#d9dadb",
                    "inverse-primary": "#c6c6c6"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-mobile": "16px",
                    "stack-lg": "32px",
                    "sidebar-width": "260px",
                    "stack-sm": "8px",
                    "stack-md": "16px",
                    "container-max": "1200px",
                    "gutter": "24px"
            },
            "fontFamily": {
                    "headline-md-mobile": ["Hanken Grotesk"],
                    "label-caps": ["Inter"],
                    "code-sm": ["Inter"],
                    "headline-md": ["Hanken Grotesk"],
                    "body-md": ["Inter"],
                    "title-sm": ["Inter"],
                    "display-lg": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "headline-md-mobile": ["20px", {"lineHeight": "1.3", "fontWeight": "600"}],
                    "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                    "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                    "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                    "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
        
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md overflow-hidden">
<!-- Shared SideNavBar -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter z-50">
<div class="mb-10">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="text-on-surface-variant text-sm mt-1">Shop Management</p>
</div>
<nav class="flex-1 space-y-1">
<!-- Dashboard -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined text-[20px]">dashboard</span>
<span class="font-body-md">Dashboard</span>
</a>
<!-- Shops -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined text-[20px]">storefront</span>
<span class="font-body-md">Shops</span>
</a>
<!-- Admin Accounts -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined text-[20px]">manage_accounts</span>
<span class="font-body-md">Admin Accounts</span>
</a>
<!-- Platform Reports -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined text-[20px]">analytics</span>
<span class="font-body-md">Platform Reports</span>
</a>
<!-- System Logs (Active State) -->
<a class="flex items-center gap-3 px-3 py-2 bg-primary text-on-primary rounded-xl transition-transform active:scale-[0.99] duration-150" href="#">
<span class="material-symbols-outlined text-[20px]">terminal</span>
<span class="font-body-md">System Logs</span>
</a>
<!-- Settings -->
<a class="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl group" href="#">
<span class="material-symbols-outlined text-[20px]">settings</span>
<span class="font-body-md">Settings</span>
</a>
</nav>
<div class="mt-auto pt-6 border-t border-outline-variant">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant">person</span>
</div>
<div class="flex-1 overflow-hidden">
<p class="text-on-surface font-bold truncate text-sm">Administrator</p>
<p class="text-on-surface-variant text-xs truncate">admin@kambuja.com</p>
</div>
</div>
</div>
</aside>
<!-- Main Content Area -->
<main class="ml-[260px] h-screen flex flex-col bg-background">
<!-- Shared TopAppBar -->
<header class="flex justify-between items-center h-16 px-gutter border-b border-outline-variant bg-background">
<div class="flex items-center gap-4">
<span class="material-symbols-outlined text-on-surface cursor-pointer hover:opacity-70">menu_open</span>
<h2 class="font-headline-md text-headline-md text-primary">System Logs</h2>
</div>
<div class="flex items-center gap-4">
<button class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
<div class="h-8 w-px bg-outline-variant mx-2"></div>
<div class="flex items-center gap-3">
<span class="text-on-surface font-bold text-sm">Pkay</span>
<img class="w-8 h-8 rounded-full border border-outline-variant" data-alt="A professional close-up headshot of a corporate administrator in a bright, modern office setting. High-key lighting, soft white background, sharp focus, wearing minimalist business attire. Professional, high-contrast, clean light-mode aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFwO7A8j1T7bqNybLNAYhFoxcZCQq5N5iORibQSNyjRp2LcsBgkhX5lIrI5kNfJvMXhzZJo-XSQwl8FHAiwwNVLk2eMBjHvgKeu-hS1n1kNylSPIz-3VyOH07R5y5JJvU5F7hqfPstDNajImQrvQhUTD1-YVQzNPyq_hSt7_vHIS5os48LgOP6qUW6hb8X_0G-tEza4N6zY_ave-Cr4JxoQiKFMH0MBuxFXIDAOAlO9hKrbL4kzHQY8vzgjvp38BoQeZB8wT6M5uGJ"/>
</div>
</div>
</header>
<!-- Content Canvas -->
<div class="flex-1 overflow-y-auto p-gutter fade-in">
<div class="max-w-container-max mx-auto space-y-6">
<!-- Filter & Action Bar -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-outline-variant p-4 rounded-lg">
<div class="flex items-center gap-2">
<div class="relative">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="pl-10 pr-4 py-2 border border-outline-variant rounded bg-background focus:ring-0 focus:border-primary text-sm w-full md:w-64 placeholder:text-on-surface-variant" placeholder="Filter logs..." type="text"/>
</div>
<button class="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-high rounded text-sm font-semibold flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-sm">filter_list</span>
                            Filter
                        </button>
</div>
<div class="flex items-center gap-2">
<button class="px-4 py-2 border border-outline-variant text-on-surface hover:bg-surface-container-high rounded text-sm font-semibold flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-sm">download</span>
                            Export CSV
                        </button>
<button class="px-4 py-2 bg-primary text-on-primary rounded text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined text-sm">refresh</span>
                            Refresh
                        </button>
</div>
</div>
<!-- Audit Log Table Container -->
<div class="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-surface-container-low border-b border-outline-variant">
<tr>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Date</th>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">User</th>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Shop</th>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Action</th>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Entity</th>
<th class="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Details</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Data Row 1 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant whitespace-nowrap">2023-11-24 14:32:01</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] font-bold text-on-secondary-fixed">PK</div>
<span class="font-body-md font-semibold">Pkay Admin</span>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface">Kambuja Flagship</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[11px] font-bold">
<span class="w-1.5 h-1.5 rounded-full bg-on-secondary-container"></span>
                                            UPDATE_STOCK
                                        </span>
</td>
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant italic">Product_ID: 9928</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</td>
</tr>
<!-- Data Row 2 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant whitespace-nowrap">2023-11-24 14:28:15</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">SY</div>
<span class="font-body-md font-semibold">System Task</span>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface">Universal</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
<span class="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed"></span>
                                            DAILY_BACKUP
                                        </span>
</td>
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant italic">DB_Snapshot_001</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</td>
</tr>
<!-- Data Row 3 -->
<tr class="hover:bg-surface-container-lowest transition-colors group">
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant whitespace-nowrap">2023-11-24 14:15:44</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<div class="w-6 h-6 rounded-full bg-error-container flex items-center justify-center text-[10px] font-bold text-on-error-container">JD</div>
<span class="font-body-md font-semibold">John Doe</span>
</div>
</td>
<td class="px-6 py-4 font-body-md text-on-surface">Riverside Mall</td>
<td class="px-6 py-4">
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold">
<span class="w-1.5 h-1.5 rounded-full bg-error"></span>
                                            AUTH_FAILURE
                                        </span>
</td>
<td class="px-6 py-4 font-code-sm text-code-sm text-on-surface-variant italic">User_Account: 4410</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">visibility</span>
</button>
</td>
</tr>
<!-- Empty State Simulation Area (as requested in prompt) -->
<tr class="bg-surface-container-lowest">
<td class="px-6 py-12 text-center" colspan="6">
<div class="flex flex-col items-center gap-2">
<span class="material-symbols-outlined text-4xl text-outline-variant">history_toggle_off</span>
<p class="text-on-surface-variant font-body-md italic">No further audit logs found for the current period.</p>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Footer -->
<div class="p-4 border-t border-outline-variant flex items-center justify-between">
<span class="text-xs text-on-surface-variant font-body-md">Showing 3 of 42 logs</span>
<div class="flex items-center gap-1">
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
<span class="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded text-xs font-bold">1</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-xs">2</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-xs">3</button>
<span class="px-1 text-on-surface-variant">...</span>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
<span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Bento Statistics Row -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-surface border border-outline-variant p-6 rounded-lg">
<h3 class="font-label-caps text-label-caps text-on-surface-variant mb-4">LOG VOLUME (24H)</h3>
<div class="flex items-end gap-2">
<span class="text-4xl font-display-lg font-bold text-on-surface leading-none">1,284</span>
<span class="text-secondary font-bold text-sm mb-1">+12%</span>
</div>
<p class="text-xs text-on-surface-variant mt-2">Active processing from 14 nodes</p>
</div>
<div class="bg-surface border border-outline-variant p-6 rounded-lg">
<h3 class="font-label-caps text-label-caps text-on-surface-variant mb-4">CRITICAL ERRORS</h3>
<div class="flex items-end gap-2">
<span class="text-4xl font-display-lg font-bold text-error leading-none">02</span>
<span class="text-error font-bold text-sm mb-1">Alert</span>
</div>
<p class="text-xs text-on-surface-variant mt-2">Resolved automatically by handler</p>
</div>
<div class="bg-surface border border-outline-variant p-6 rounded-lg relative overflow-hidden">
<h3 class="font-label-caps text-label-caps text-on-surface-variant mb-4">SYSTEM UPTIME</h3>
<div class="flex items-end gap-2">
<span class="text-4xl font-display-lg font-bold text-on-surface leading-none">99.98%</span>
</div>
<p class="text-xs text-on-surface-variant mt-2">SLA target achieved for Q4</p>
<!-- Subtle background visual for bento effect -->
<div class="absolute -right-4 -bottom-4 opacity-5">
<span class="material-symbols-outlined text-[120px]">terminal</span>
</div>
</div>
</div>
</div>
</div>
</main>
<script>
        // Simple interactivity for demonstration
        document.addEventListener('DOMContentLoaded', () => {
            const tableRows = document.querySelectorAll('tbody tr');
            tableRows.forEach(row => {
                row.addEventListener('click', () => {
                    // Visual feedback on click
                    row.classList.add('bg-surface-container-high');
                    setTimeout(() => {
                        row.classList.remove('bg-surface-container-high');
                    }, 200);
                });
            });
        });
    </script>
</body></html>

<!-- Settings - Kambuja Platform -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kambuja Platform - Settings</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700&amp;family=Inter:wght@400;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                "on-tertiary-fixed": "#1b1b1b",
                "inverse-on-surface": "#f0f1f2",
                "surface-container": "#edeeef",
                "primary-fixed-dim": "#c6c6c6",
                "tertiary": "#000000",
                "secondary-fixed-dim": "#c0c1ff",
                "on-surface-variant": "#4c4546",
                "on-surface": "#191c1d",
                "error-container": "#ffdad6",
                "tertiary-container": "#1b1b1b",
                "surface-variant": "#e1e3e4",
                "background": "#f8f9fa",
                "surface-container-low": "#f3f4f5",
                "surface": "#f8f9fa",
                "on-secondary-fixed": "#07006c",
                "surface-container-highest": "#e1e3e4",
                "surface-bright": "#f8f9fa",
                "primary-container": "#1b1b1b",
                "on-tertiary-fixed-variant": "#474747",
                "on-tertiary-container": "#848484",
                "inverse-surface": "#2e3132",
                "on-error-container": "#93000a",
                "on-tertiary": "#ffffff",
                "secondary-container": "#6063ee",
                "tertiary-fixed-dim": "#c6c6c6",
                "tertiary-fixed": "#e2e2e2",
                "surface-container-high": "#e7e8e9",
                "on-background": "#191c1d",
                "on-primary-fixed-variant": "#474747",
                "surface-tint": "#5e5e5e",
                "on-secondary-container": "#fffbff",
                "primary-fixed": "#e2e2e2",
                "on-error": "#ffffff",
                "on-primary": "#ffffff",
                "outline": "#7e7576",
                "on-primary-container": "#848484",
                "surface-container-lowest": "#ffffff",
                "primary": "#000000",
                "secondary": "#4648d4",
                "error": "#ba1a1a",
                "secondary-fixed": "#e1e0ff",
                "on-primary-fixed": "#1b1b1b",
                "outline-variant": "#cfc4c5",
                "on-secondary-fixed-variant": "#2f2ebe",
                "on-secondary": "#ffffff",
                "surface-dim": "#d9dadb",
                "inverse-primary": "#c6c6c6"
            },
            "borderRadius": {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
            "spacing": {
                "margin-mobile": "16px",
                "stack-lg": "32px",
                "sidebar-width": "260px",
                "stack-sm": "8px",
                "stack-md": "16px",
                "container-max": "1200px",
                "gutter": "24px"
            },
            "fontFamily": {
                "headline-md": ["Hanken Grotesk"],
                "label-caps": ["Inter"],
                "code-sm": ["Inter"],
                "body-md": ["Inter"],
                "title-sm": ["Inter"],
                "display-lg": ["Hanken Grotesk"]
            },
            "fontSize": {
                "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                "code-sm": ["13px", {"lineHeight": "1.4", "fontWeight": "400"}],
                "headline-md": ["24px", {"lineHeight": "1.3", "letterSpacing": "-0.01em", "fontWeight": "600"}],
                "body-md": ["14px", {"lineHeight": "1.6", "fontWeight": "400"}],
                "title-sm": ["16px", {"lineHeight": "1.5", "fontWeight": "600"}],
                "display-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700"}]
            }
          },
        },
      }
    </script>
<style>
        body {
            background-color: #f8f9fa;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .sidebar-active {
            background-color: #000000;
            color: #ffffff;
            border-radius: 0.5rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cfc4c5;
            border-radius: 2px;
        }
    </style>
</head>
<body class="font-body-md text-on-surface overflow-hidden">
<!-- Sidebar Component (Shared) -->
<aside class="fixed left-0 top-0 h-full w-[260px] bg-surface border-r border-outline-variant flex flex-col p-gutter z-50">
<div class="mb-stack-lg">
<h1 class="font-display-lg text-display-lg font-bold text-on-surface">Kambuja</h1>
<p class="text-on-surface-variant text-sm mt-1">Shop Management</p>
</div>
<nav class="flex-1 space-y-2">
<a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-body-md text-body-md">Dashboard</span>
</a>
<a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined">storefront</span>
<span class="font-body-md text-body-md">Shops</span>
</a>
<a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined">manage_accounts</span>
<span class="font-body-md text-body-md">Admin Accounts</span>
</a>
<a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="font-body-md text-body-md">Platform Reports</span>
</a>
<a class="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-xl" href="#">
<span class="material-symbols-outlined">terminal</span>
<span class="font-body-md text-body-md">System Logs</span>
</a>
<a class="flex items-center gap-3 p-3 bg-primary text-on-primary rounded-xl transition-transform duration-150 active:scale-[0.99]" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-md text-body-md">Settings</span>
</a>
</nav>
<div class="mt-auto pt-stack-md">
<div class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-primary-container text-sm">person</span>
</div>
<div>
<p class="text-sm font-bold leading-none">Admin User</p>
<p class="text-xs text-on-surface-variant mt-1">Super Admin</p>
</div>
</div>
</div>
</aside>
<!-- Top App Bar Component (Shared) -->
<header class="flex justify-between items-center h-16 px-gutter ml-[260px] bg-background border-b border-outline-variant sticky top-0 z-40">
<h2 class="font-headline-md text-headline-md text-primary font-bold">Kambuja Platform</h2>
<div class="flex items-center gap-stack-md">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors active:opacity-80">
<span class="material-symbols-outlined">help</span>
</button>
<div class="w-px h-6 bg-outline-variant mx-2"></div>
<div class="flex items-center gap-2">
<span class="text-sm font-semibold">Pkay</span>
<img class="w-8 h-8 rounded-full object-cover border border-outline" data-alt="A high-contrast profile portrait of a tech executive in a minimalist studio setting, using deep black backgrounds and sharp, white directional lighting to create a professional and authoritative aesthetic consistent with the Kambuja brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAslkEnFpocJXo_kHi-f-nehOTwgHAhs2Hgp-aGhMOsPPHYC6P-iG4WwIhXLwU_UDfBB-gO199VJQ0aaARxNjKOHy7qC5W5U6-09N9sThD8nKkB7Y2TYb5WRcUSwPi0XSMFfYyYdi4uTgUth-48raZkbY_XqwnG08l44a9IT51FQ0VJ7FVI_0aVjyemVC_ptOsXTbWEBjxQ_qwNuzCNMQb2b15_j2Zt0dgxzIehpLnFnzvL2mgC7zLkEL5JmDNNWU7o3p-YdBOniUY0"/>
</div>
</div>
</header>
<!-- Main Content -->
<main class="ml-[260px] p-gutter h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
<div class="max-w-[1200px] mx-auto">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-stack-md mb-stack-lg">
<div>
<h3 class="font-display-lg text-display-lg font-bold">Platform Settings</h3>
<p class="text-on-surface-variant mt-2 font-body-md text-body-md">Manage environment-level configurations and critical platform defaults.</p>
</div>
<div class="flex gap-stack-sm">
<button class="px-6 py-2.5 rounded border border-primary text-primary font-semibold text-sm hover:bg-surface-container-high transition-colors">Discard Changes</button>
<button class="px-6 py-2.5 rounded bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity">Save All Configurations</button>
</div>
</div>
<!-- Bento Layout for Settings -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-stack-md">
<!-- Environment Banner -->
<div class="lg:col-span-12 bg-surface-container-low border border-outline-variant p-stack-md rounded flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-secondary-container">shield_with_heart</span>
</div>
<div>
<p class="font-semibold text-sm">Security Policy</p>
<p class="text-sm text-on-surface-variant">Platform settings remain environment-controlled. No secret values are exposed in the frontend.</p>
</div>
</div>
<!-- Global Configuration Card -->
<div class="lg:col-span-8 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded shadow-sm">
<div class="flex items-center gap-2 mb-stack-lg">
<span class="material-symbols-outlined text-primary">settings_applications</span>
<h4 class="font-title-sm text-title-sm uppercase tracking-wider text-on-surface-variant">General Core Settings</h4>
</div>
<div class="space-y-stack-lg">
<div class="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">PLATFORM_NAME</label>
<input class="w-full px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-medium" type="text" value="Kambuja Mainframe v2.4"/>
</div>
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">SUPPORT_EMAIL_PRIMARY</label>
<input class="w-full px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-medium" type="email" value="ops@kambuja.com"/>
</div>
</div>
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">API_BASE_ENDPOINT</label>
<div class="flex">
<span class="bg-surface-container-high border border-r-0 border-outline-variant px-3 flex items-center text-xs text-on-surface-variant rounded-l">https://</span>
<input class="w-full px-4 py-3 border border-outline-variant rounded-r focus:ring-0 focus:border-primary text-sm font-medium" type="text" value="api.kambuja-platform.io/v1"/>
</div>
</div>
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">SYSTEM_MAINTENANCE_WINDOW</label>
<select class="w-full px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-medium">
<option>Sunday 02:00 AM - 04:00 AM (GMT)</option>
<option>Saturday 11:00 PM - 01:00 AM (GMT)</option>
</select>
</div>
</div>
</div>
<!-- API Quota & Usage -->
<div class="lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded shadow-sm flex flex-col">
<div class="flex items-center gap-2 mb-stack-lg">
<span class="material-symbols-outlined text-primary">data_usage</span>
<h4 class="font-title-sm text-title-sm uppercase tracking-wider text-on-surface-variant">Performance Quotas</h4>
</div>
<div class="space-y-6 flex-1">
<div>
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold uppercase text-on-surface-variant">Request Limit</span>
<span class="text-xs font-bold">82%</span>
</div>
<div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 82%"></div>
</div>
<p class="text-[10px] text-on-surface-variant mt-2 uppercase tracking-tight">8.2M / 10M Monthly Requests</p>
</div>
<div>
<div class="flex justify-between items-center mb-2">
<span class="text-xs font-bold uppercase text-on-surface-variant">Storage Capacity</span>
<span class="text-xs font-bold">45%</span>
</div>
<div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
<div class="h-full bg-primary" style="width: 45%"></div>
</div>
<p class="text-[10px] text-on-surface-variant mt-2 uppercase tracking-tight">450GB / 1TB Object Storage</p>
</div>
</div>
<div class="mt-stack-lg pt-stack-md border-t border-outline-variant">
<button class="w-full text-center py-2 text-xs font-bold uppercase hover:bg-surface-container-high transition-colors">Adjust Quotas</button>
</div>
</div>
<!-- Security & Secrets Section -->
<div class="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
<div class="px-stack-lg py-stack-md bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">encrypted</span>
<h4 class="font-title-sm text-title-sm uppercase tracking-wider text-on-surface-variant">Environment Variables &amp; Secrets</h4>
</div>
<span class="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded font-bold">LOCKED</span>
</div>
<div class="p-0">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-highest">
<th class="px-stack-lg py-3 font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">KEY</th>
<th class="px-stack-lg py-3 font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">VALUE</th>
<th class="px-stack-lg py-3 font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant">SOURCE</th>
<th class="px-stack-lg py-3 font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant text-right">ACTION</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
<td class="px-stack-lg py-4 font-code-sm text-code-sm font-bold">AWS_S3_BUCKET_ID</td>
<td class="px-stack-lg py-4">
<div class="flex items-center gap-2">
<span class="text-xs text-on-surface-variant">••••••••••••••••</span>
<span class="material-symbols-outlined text-xs cursor-pointer hover:text-primary">visibility</span>
</div>
</td>
<td class="px-stack-lg py-4">
<span class="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant">
<div class="w-1.5 h-1.5 rounded-full bg-green-500"></div> VAULT
                                        </span>
</td>
<td class="px-stack-lg py-4 text-right">
<button class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-sm">edit</span></button>
</td>
</tr>
<tr class="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
<td class="px-stack-lg py-4 font-code-sm text-code-sm font-bold">STRIPE_SECRET_KEY</td>
<td class="px-stack-lg py-4">
<div class="flex items-center gap-2">
<span class="text-xs text-on-surface-variant">••••••••••••••••</span>
<span class="material-symbols-outlined text-xs cursor-pointer hover:text-primary">visibility</span>
</div>
</td>
<td class="px-stack-lg py-4">
<span class="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant">
<div class="w-1.5 h-1.5 rounded-full bg-green-500"></div> VAULT
                                        </span>
</td>
<td class="px-stack-lg py-4 text-right">
<button class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-sm">edit</span></button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-stack-lg py-4 font-code-sm text-code-sm font-bold">NODE_ENV</td>
<td class="px-stack-lg py-4">
<span class="px-2 py-0.5 bg-secondary text-on-secondary rounded text-[10px] font-bold">production</span>
</td>
<td class="px-stack-lg py-4">
<span class="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant">
<div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div> ENV_FILE
                                        </span>
</td>
<td class="px-stack-lg py-4 text-right">
<button class="text-on-surface-variant hover:text-primary"><span class="material-symbols-outlined text-sm">edit</span></button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Webhook Notifications -->
<div class="lg:col-span-6 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded shadow-sm">
<div class="flex justify-between items-center mb-stack-lg">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary">webhook</span>
<h4 class="font-title-sm text-title-sm uppercase tracking-wider text-on-surface-variant">Webhook Routing</h4>
</div>
<button class="text-xs font-bold text-primary underline decoration-2 underline-offset-4">Add New Endpoint</button>
</div>
<div class="space-y-stack-md">
<div class="flex items-center justify-between p-3 border border-outline-variant rounded bg-surface">
<div class="flex flex-col">
<span class="text-xs font-bold">Order Creation Hook</span>
<span class="text-[11px] text-on-surface-variant font-mono">https://hooks.slack.com/services/T0...</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<div class="flex items-center justify-between p-3 border border-outline-variant rounded bg-surface">
<div class="flex flex-col">
<span class="text-xs font-bold">System Health Alerts</span>
<span class="text-[11px] text-on-surface-variant font-mono">https://ops.kambuja.com/webhooks/health</span>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-9 h-5 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>
</div>
<!-- Branding & Localization -->
<div class="lg:col-span-6 bg-surface-container-lowest border border-outline-variant p-stack-lg rounded shadow-sm">
<div class="flex items-center gap-2 mb-stack-lg">
<span class="material-symbols-outlined text-primary">language</span>
<h4 class="font-title-sm text-title-sm uppercase tracking-wider text-on-surface-variant">Global Localization</h4>
</div>
<div class="grid grid-cols-2 gap-stack-md">
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">DEFAULT_CURRENCY</label>
<select class="w-full px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-medium">
<option>USD ($)</option>
<option>KHR (៛)</option>
<option>EUR (€)</option>
</select>
</div>
<div>
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">DEFAULT_TIMEZONE</label>
<select class="w-full px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-medium">
<option>UTC+7 (Phnom Penh)</option>
<option>UTC+0 (London)</option>
<option>UTC-5 (New York)</option>
</select>
</div>
</div>
<div class="mt-stack-md">
<label class="font-label-caps text-label-caps block mb-2 text-on-surface-variant">PLATFORM_ACCENT_COLOR</label>
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded border border-outline-variant bg-primary"></div>
<input class="flex-1 px-4 py-3 border border-outline-variant rounded focus:ring-0 focus:border-primary text-sm font-code-sm" type="text" value="#000000"/>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Side Tools Anchor (Decorative/Utility) -->
<div class="fixed right-0 top-0 h-full w-12 bg-surface-container-highest border-l border-outline-variant flex flex-col items-center py-stack-md gap-4 z-30">
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors" title="Bookmarks">
<span class="material-symbols-outlined text-[20px]">book</span>
</button>
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors" title="Insights">
<span class="material-symbols-outlined text-[20px]">auto_awesome</span>
</button>
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors" title="Activity">
<span class="material-symbols-outlined text-[20px]">videocam</span>
</button>
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors" title="Billing">
<span class="material-symbols-outlined text-[20px]">wallet</span>
</button>
<div class="w-6 h-px bg-outline-variant my-2"></div>
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded transition-colors" title="Add Tool">
<span class="material-symbols-outlined text-[20px]">add</span>
</button>
</div>
<script>
        // Simple interactivity for form fields and micro-interactions
        document.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('focus', () => {
                el.parentElement.classList.add('scale-[1.01]');
                el.style.transition = 'transform 0.2s ease-in-out';
            });
            el.addEventListener('blur', () => {
                el.parentElement.classList.remove('scale-[1.01]');
            });
        });

        // Password visibility toggle simulation
        document.querySelectorAll('.material-symbols-outlined').forEach(icon => {
            if (icon.textContent === 'visibility') {
                icon.addEventListener('click', function() {
                    this.textContent = this.textContent === 'visibility' ? 'visibility_off' : 'visibility';
                    const valueContainer = this.previousElementSibling;
                    if (this.textContent === 'visibility_off') {
                        valueContainer.textContent = '8Xk-S3-Kambuja-2024-LIVE';
                        valueContainer.classList.add('font-mono', 'text-[10px]');
                    } else {
                        valueContainer.textContent = '••••••••••••••••';
                        valueContainer.classList.remove('font-mono', 'text-[10px]');
                    }
                });
            }
        });
    </script>
</body></html>