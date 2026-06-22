<!-- Login - Master POS -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Login | Master POS Admin Suite</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-tint": "#565e74",
                    "inverse-primary": "#bec6e0",
                    "surface-container-low": "#eff4ff",
                    "on-background": "#0b1c30",
                    "on-secondary-container": "#fefcff",
                    "on-error-container": "#93000a",
                    "tertiary": "#000000",
                    "primary-fixed-dim": "#bec6e0",
                    "primary-container": "#131b2e",
                    "inverse-surface": "#213145",
                    "primary": "#000000",
                    "surface-container-highest": "#d3e4fe",
                    "surface-dim": "#cbdbf5",
                    "on-primary": "#ffffff",
                    "surface-container-high": "#dce9ff",
                    "on-secondary": "#ffffff",
                    "tertiary-fixed": "#6ffbbe",
                    "on-secondary-fixed-variant": "#004395",
                    "on-tertiary-fixed": "#002113",
                    "outline": "#76777d",
                    "on-primary-fixed-variant": "#3f465c",
                    "on-error": "#ffffff",
                    "secondary-fixed-dim": "#adc6ff",
                    "secondary-container": "#2170e4",
                    "outline-variant": "#c6c6cd",
                    "background": "#f8f9ff",
                    "surface-variant": "#d3e4fe",
                    "on-tertiary": "#ffffff",
                    "inverse-on-surface": "#eaf1ff",
                    "surface": "#f8f9ff",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f8f9ff",
                    "on-tertiary-fixed-variant": "#005236",
                    "on-surface": "#0b1c30",
                    "on-primary-fixed": "#131b2e",
                    "tertiary-container": "#002113",
                    "surface-container": "#e5eeff",
                    "primary-fixed": "#dae2fd",
                    "on-secondary-fixed": "#001a42",
                    "on-primary-container": "#7c839b",
                    "error-container": "#ffdad6",
                    "secondary-fixed": "#d8e2ff",
                    "error": "#ba1a1a",
                    "on-tertiary-container": "#009668",
                    "on-surface-variant": "#45464d",
                    "secondary": "#0058be",
                    "tertiary-fixed-dim": "#4edea3"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "sm": "8px",
                    "xs": "4px",
                    "md": "16px",
                    "container-margin": "24px",
                    "xl": "32px",
                    "lg": "24px",
                    "base-unit": "4px",
                    "gutter": "16px"
            },
            "fontFamily": {
                    "title-sm": ["Hanken Grotesk"],
                    "display-lg": ["Hanken Grotesk"],
                    "headline-md": ["Hanken Grotesk"],
                    "body-sm": ["Hanken Grotesk"],
                    "label-caps": ["Hanken Grotesk"],
                    "data-tabular": ["Hanken Grotesk"],
                    "body-base": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "title-sm": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "display-lg": ["30px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "body-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
                    "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "data-tabular": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
                    "body-base": ["14px", {"lineHeight": "20px", "fontWeight": "400"}]
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
        body {
            font-family: 'Hanken Grotesk', sans-serif;
            background-color: #F8FAFC;
        }
        .login-card {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid #E2E8F0;
        }
        .input-field:focus-within {
            border-color: #3B82F6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        /* Custom scrollbar for data centric feel */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen flex items-center justify-center p-md">
<!-- Main Container: Split Layout inspired by the user request -->
<main class="flex w-full max-w-[1000px] bg-surface-container-lowest rounded-xl overflow-hidden login-card min-h-[600px]">
<!-- Left Panel: Branding & Visual Anchor -->
<section class="hidden md:flex md:w-1/2 relative bg-secondary-container p-xl flex-col justify-between overflow-hidden">
<!-- Animated Background Shader (Decorative) -->

<div class="relative z-10">
<div class="flex items-center gap-sm mb-xl">
<div class="w-12 h-12 bg-on-secondary-container rounded-lg flex items-center justify-center">
<span class="material-symbols-outlined text-secondary text-[32px]">point_of_sale</span>
</div>
<div>
<h1 class="font-headline-md text-headline-md text-on-secondary-container font-bold tracking-tight">Master POS</h1>
<p class="font-body-sm text-body-sm text-on-secondary-container opacity-80">Admin Suite v4.2</p>
</div>
</div>
<div class="mt-xl">
<h2 class="font-display-lg text-display-lg text-on-secondary-container leading-tight mb-md">
                        Systematic control <br/>for your enterprise.
                    </h2>
<p class="font-body-base text-body-base text-on-secondary-container opacity-90 max-w-[320px]">
                        Access your real-time inventory tracking, sales analytics, and multi-store management tools in one secure location.
                    </p>
</div>
</div>
<div class="relative z-10 mt-auto">
<div class="grid grid-cols-2 gap-md">
<div class="p-md bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
<span class="material-symbols-outlined text-on-secondary-container mb-xs">monitoring</span>
<p class="font-label-caps text-label-caps text-on-secondary-container uppercase opacity-70">Daily Traffic</p>
<p class="font-title-sm text-title-sm text-on-secondary-container">+14.2%</p>
</div>
<div class="p-md bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
<span class="material-symbols-outlined text-on-secondary-container mb-xs">inventory</span>
<p class="font-label-caps text-label-caps text-on-secondary-container uppercase opacity-70">Stock Level</p>
<p class="font-title-sm text-title-sm text-on-secondary-container">98.4%</p>
</div>
</div>
</div>
<!-- Subtle brand imagery placeholder -->
<div class="absolute bottom-[-10%] right-[-10%] opacity-10 rotate-12">
<span class="material-symbols-outlined text-[240px] text-on-secondary-container">layers</span>
</div>
</section>
<!-- Right Panel: Login Form -->
<section class="w-full md:w-1/2 p-xl flex flex-col justify-center bg-white">
<div class="max-w-[360px] mx-auto w-full">
<!-- Mobile Branding (Hidden on Desktop) -->
<div class="md:hidden flex flex-col items-center mb-xl">
<div class="w-16 h-16 bg-secondary-container rounded-xl flex items-center justify-center mb-md">
<span class="material-symbols-outlined text-on-secondary-container text-[40px]">point_of_sale</span>
</div>
<h1 class="font-headline-md text-headline-md text-on-surface font-bold">Master POS</h1>
</div>
<div class="mb-xl">
<h2 class="font-headline-md text-headline-md text-on-surface mb-xs">Sign In</h2>
<p class="font-body-base text-body-base text-on-surface-variant">Please enter your credentials to access the dashboard.</p>
</div>
<form class="space-y-lg">
<!-- Email Input -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" for="email">Email Address</label>
<div class="input-field flex items-center border border-outline-variant rounded-lg px-md h-12 transition-all bg-surface-container-lowest">
<span class="material-symbols-outlined text-on-surface-variant mr-sm">mail</span>
<input class="w-full bg-transparent border-none focus:ring-0 font-body-base text-body-base text-on-surface placeholder:text-outline" id="email" name="email" placeholder="name@company.com" required="" type="email"/>
</div>
</div>
<!-- Password Input -->
<div class="space-y-xs">
<div class="flex justify-between items-center">
<label class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" for="password">Password</label>
<a class="font-body-sm text-body-sm text-secondary hover:underline" href="#">Forgot password?</a>
</div>
<div class="input-field flex items-center border border-outline-variant rounded-lg px-md h-12 transition-all bg-surface-container-lowest">
<span class="material-symbols-outlined text-on-surface-variant mr-sm">lock</span>
<input class="w-full bg-transparent border-none focus:ring-0 font-body-base text-body-base text-on-surface placeholder:text-outline" id="password" name="password" placeholder="••••••••" required="" type="password"/>
<button class="text-on-surface-variant hover:text-on-surface transition-colors" type="button">
<span class="material-symbols-outlined">visibility</span>
</button>
</div>
</div>
<!-- Remember Me -->
<div class="flex items-center space-x-sm">
<input class="w-4 h-4 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer" id="remember" type="checkbox"/>
<label class="font-body-sm text-body-sm text-on-surface-variant cursor-pointer select-none" for="remember">Remember me for 30 days</label>
</div>
<!-- Submit Button -->
<button class="w-full bg-primary text-on-primary h-12 rounded-lg font-title-sm text-title-sm shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-sm" type="submit">
<span>Sign In</span>
<span class="material-symbols-outlined">login</span>
</button>
</form>
<!-- Alternative Methods -->
<div class="mt-xl">
<div class="relative flex py-md items-center">
<div class="flex-grow border-t border-outline-variant"></div>
<span class="flex-shrink mx-md font-label-caps text-label-caps text-outline uppercase">Or Login With</span>
<div class="flex-grow border-t border-outline-variant"></div>
</div>
<div class="grid grid-cols-2 gap-md mt-md">
<button class="flex items-center justify-center gap-sm border border-outline-variant rounded-lg h-10 font-body-base text-body-base hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined text-body-base">qr_code_scanner</span>
<span>Scan QR</span>
</button>
<button class="flex items-center justify-center gap-sm border border-outline-variant rounded-lg h-10 font-body-base text-body-base hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined text-body-base">passkey</span>
<span>Passkey</span>
</button>
</div>
</div>
<div class="mt-xl pt-lg border-t border-outline-variant text-center">
<p class="font-body-sm text-body-sm text-on-surface-variant">
                        New to Master POS? 
                        <a class="text-secondary font-semibold hover:underline" href="#">Request Access</a>
</p>
</div>
</div>
</section>
</main>
<!-- Background Decoration Image (Enterprise Architecture feel) -->
<div class="fixed inset-0 z-[-1] pointer-events-none opacity-5">
<div class="bg-cover bg-center w-full h-full" data-alt="A clean, minimalist high-tech server room with glowing blue LED indicator lights on sleek black server racks. The image is shot with a shallow depth of field, highlighting the precision and organization of enterprise data infrastructure. The lighting is cold and modern, emphasizing a secure and professional cloud computing environment." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7bH5w0i3OTNPqkOek2743JEvaoYkgoNswQ7wNqbsqTq4cUH3nNSQArzEwfRv2XdXzI5QxEV-R5gyrQC2PTKq_Dw1o1JFUc8ZU5L7VlTwxtgXwgLkWVR_q7WEmYbzUwgYFnR3ZSQCJFj25LZV5Y9bh_QxFiOqS3uSdGRYA4LEcr6dBvaXxOZVWJmacNdNT6Pg1zQVsMnMzRtr4SHhhzUAB46LU1ZfEDdAVrA2yxluOfk_OZVjYC3kQLVFd2BW93FQzM1lCcwGVIfEF')"></div>
</div>
<!-- Micro-interactions Script -->
<script>
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.querySelector('form');
            const submitBtn = form.querySelector('button[type="submit"]');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                submitBtn.innerHTML = `
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                `;

                // Simulate network latency
                setTimeout(() => {
                    alert('Login Simulation: Credentials processed. In a real application, you would be redirected to the Dashboard.');
                    submitBtn.innerHTML = `<span>Sign In</span><span class="material-symbols-outlined">login</span>`;
                }, 1500);
            });

            // Password toggle logic
            const togglePass = document.querySelector('button[type="button"]');
            const passInput = document.getElementById('password');
            togglePass.addEventListener('click', () => {
                const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passInput.setAttribute('type', type);
                togglePass.querySelector('span').innerText = type === 'password' ? 'visibility' : 'visibility_off';
            });
        });
    </script>

</body></html>

<!-- Dashboard - Master POS -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Master POS Admin Suite - Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        body { font-family: 'Hanken Grotesk', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .chart-bar:hover { filter: brightness(1.2); transition: all 0.2s ease; }
    </style>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "error-container": "#ffdad6",
                      "on-tertiary-container": "#009668",
                      "on-primary-container": "#7c839b",
                      "primary-fixed": "#dae2fd",
                      "surface-bright": "#f8f9ff",
                      "on-secondary-fixed": "#001a42",
                      "inverse-on-surface": "#eaf1ff",
                      "surface-container-high": "#dce9ff",
                      "tertiary": "#000000",
                      "primary-fixed-dim": "#bec6e0",
                      "surface-dim": "#cbdbf5",
                      "tertiary-fixed": "#6ffbbe",
                      "outline-variant": "#c6c6cd",
                      "on-tertiary-fixed-variant": "#005236",
                      "secondary-fixed-dim": "#adc6ff",
                      "surface-container-lowest": "#ffffff",
                      "primary-container": "#131b2e",
                      "surface-container-low": "#eff4ff",
                      "inverse-primary": "#bec6e0",
                      "on-error-container": "#93000a",
                      "background": "#f8f9ff",
                      "on-primary-fixed": "#131b2e",
                      "on-secondary-fixed-variant": "#004395",
                      "secondary": "#0058be",
                      "on-primary": "#ffffff",
                      "outline": "#76777d",
                      "on-surface": "#0b1c30",
                      "on-surface-variant": "#45464d",
                      "on-background": "#0b1c30",
                      "secondary-container": "#2170e4",
                      "surface-variant": "#d3e4fe",
                      "tertiary-fixed-dim": "#4edea3",
                      "surface-tint": "#565e74",
                      "inverse-surface": "#213145",
                      "surface-container": "#e5eeff",
                      "on-error": "#ffffff",
                      "tertiary-container": "#002113",
                      "primary": "#000000",
                      "secondary-fixed": "#d8e2ff",
                      "surface": "#f8f9ff",
                      "on-tertiary-fixed": "#002113",
                      "error": "#ba1a1a",
                      "on-secondary-container": "#fefcff",
                      "on-secondary": "#ffffff",
                      "surface-container-highest": "#d3e4fe",
                      "on-tertiary": "#ffffff",
                      "on-primary-fixed-variant": "#3f465c"
              },
              "borderRadius": {
                      "DEFAULT": "0.125rem",
                      "lg": "0.25rem",
                      "xl": "0.5rem",
                      "full": "0.75rem"
              },
              "spacing": {
                      "xs": "4px",
                      "gutter": "16px",
                      "md": "16px",
                      "xl": "32px",
                      "sm": "8px",
                      "base-unit": "4px",
                      "lg": "24px",
                      "container-margin": "24px"
              },
              "fontFamily": {
                      "headline-md": ["Hanken Grotesk"],
                      "body-base": ["Hanken Grotesk"],
                      "data-tabular": ["Hanken Grotesk"],
                      "title-sm": ["Hanken Grotesk"],
                      "label-caps": ["Hanken Grotesk"],
                      "body-sm": ["Hanken Grotesk"],
                      "display-lg": ["Hanken Grotesk"]
              },
              "fontSize": {
                      "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                      "body-base": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                      "data-tabular": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
                      "title-sm": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
                      "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                      "body-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
                      "display-lg": ["30px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "700"}]
              }
            }
          }
        }
    </script>
</head>
<body class="bg-background text-on-surface">
<!-- SideNavBar -->
<aside class="w-[260px] h-screen fixed left-0 top-0 bg-surface-container-lowest dark:bg-primary-container border-r border-outline-variant dark:border-outline flex flex-col py-lg z-50">
<div class="px-container-margin mb-xl">
<div class="flex items-center gap-sm">
<img alt="Master POS Logo" class="w-10 h-10 rounded-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3dWHgwdZ4Zfz7O4MhdEdKeGEtx3e0LftV_x0S5ZJE9c6ThLdEnT-nDZqgDWZSgSUZiQ2pn7-99OoUvCncJaBYywLiXzQYE9VQPrqfhW6W4QD2VEn_dWmVBTIrumL-HUMMpSNeqbFLotlyKX8ZTWzPAAC6ZGsYircxjzx1a_1xN148sXNqzUzjDjWmUPGV2JVZ7uKJkm_3RzFEIcTnHN1ESJE1Y0YA5jqElpzAAvCcy19NFZLqcLRERBS4DlqSHMeoGhlXlrK2YkG9"/>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-on-surface dark:text-surface-bright">Master POS</h1>
<p class="font-body-sm text-body-sm text-on-primary-container">Admin Suite</p>
</div>
</div>
</div>
<nav class="flex-1 space-y-1 px-sm overflow-y-auto">
<a class="flex items-center gap-md px-md py-sm bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary font-bold cursor-pointer transition-all duration-200" href="#">
<span class="material-symbols-outlined" data-icon="home">home</span>
<span class="font-body-base text-body-base">Home</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
<span class="font-body-base text-body-base">Supplier</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="category">category</span>
<span class="font-body-base text-body-base">Category</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
<span class="font-body-base text-body-base">Product</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="history_edu">history_edu</span>
<span class="font-body-base text-body-base">Inventory</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
<span class="font-body-base text-body-base">Purchase</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="person">person</span>
<span class="font-body-base text-body-base">Cashiers</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
<span class="font-body-base text-body-base">Notifications</span>
</a>
<a class="flex items-center gap-md px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-body-base text-body-base">Shop Settings</span>
</a>
<div class="pt-sm">
<a class="flex items-center justify-between px-md py-sm text-on-surface-variant dark:text-on-primary-container hover:bg-surface-container dark:hover:bg-on-primary-fixed-variant transition-colors cursor-pointer" href="#">
<div class="flex items-center gap-md">
<span class="material-symbols-outlined" data-icon="bar_chart">bar_chart</span>
<span class="font-body-base text-body-base">Report</span>
</div>
<span class="material-symbols-outlined text-[18px]">expand_more</span>
</a>
<div class="pl-xl space-y-1 mt-1">
<a class="flex items-center gap-md px-md py-1.5 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[16px]">show_chart</span>
<span class="font-body-sm text-body-sm">Sale Report</span>
</a>
<a class="flex items-center gap-md px-md py-1.5 text-on-surface-variant hover:text-secondary transition-colors cursor-pointer" href="#">
<span class="material-symbols-outlined text-[16px]">monitoring</span>
<span class="font-body-sm text-body-sm">Stock Report</span>
</a>
</div>
</div>
</nav>
<div class="px-container-margin mt-auto pt-lg">
<div class="p-md rounded-lg bg-surface-container-low border border-outline-variant">
<p class="font-label-caps text-label-caps text-on-surface-variant uppercase mb-xs">Storage</p>
<div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
<div class="bg-secondary h-full w-2/3"></div>
</div>
<p class="font-body-sm text-body-sm mt-xs">68% of 50GB used</p>
</div>
</div>
</aside>
<!-- TopAppBar -->
<header class="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex justify-between items-center px-container-margin z-40">
<div class="flex items-center gap-lg">
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
<span class="material-symbols-outlined">menu_open</span>
</button>
<div class="relative flex items-center">
<span class="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
<input class="pl-10 pr-md py-1.5 w-80 bg-surface-container-low border border-outline-variant rounded-full font-body-base text-body-base focus:ring-2 focus:ring-secondary/20 outline-none" placeholder="Search orders, stock, or analytics..." type="text"/>
</div>
</div>
<div class="flex items-center gap-md">
<div class="flex gap-sm">
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full">
<span class="material-symbols-outlined">help_outline</span>
</button>
</div>
<div class="h-8 w-[1px] bg-outline-variant mx-2"></div>
<div class="flex items-center gap-md cursor-pointer">
<div class="text-right">
<p class="font-title-sm text-title-sm text-on-surface">Alex Thompson</p>
<p class="font-body-sm text-body-sm text-on-surface-variant">Administrator</p>
</div>
<img alt="Admin Headshot" class="w-10 h-10 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtIdBvOiHTUUsY3HUnW1UKI0EsR2VLeXjLqXv7HufQHsOzluXUYvi-agGGFcEjViEAx1MzVKQ46VSd7ya0iFsDopUPp2qnYHdkYNhG5jroDiapGpv16fwsc6lekYJl0jZSPs3zLAkkFxh1_O9Cz5jggDq750a-g3hNFUiPeYSxQyMdHWFFajfsVV0iMPsGx6HYaWOqZt8pkdv6GnpqXg4HvAl8bH4OSeOrM-ufqsVhpr4hzMa6tSTJCsSkrkmFGHWcD9Y17ocM7mt6"/>
</div>
</div>
</header>
<!-- Main Content Canvas -->
<main class="ml-[260px] pt-16 min-h-screen p-container-margin">
<div class="flex justify-between items-center mb-lg pt-4">
<h2 class="font-display-lg text-display-lg text-on-surface">General Report</h2>
<div class="flex gap-sm">
<button class="px-md py-2 border border-outline-variant rounded-lg bg-surface-container-lowest font-title-sm flex items-center gap-sm hover:bg-surface-container">
<span class="material-symbols-outlined">calendar_today</span>
                    Today
                </button>
<button class="px-lg py-2 bg-primary text-on-primary rounded-lg font-title-sm flex items-center gap-sm hover:opacity-90 transition-all">
<span class="material-symbols-outlined">add</span>
                    New Sale
                </button>
</div>
</div>
<!-- KPI Row 1: Matching reference IMAGE_6 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
<!-- Today Revenue -->
<div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center justify-between group hover:shadow-sm transition-shadow">
<div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Today Revenue</p>
<div class="flex items-center gap-1">
<span class="font-display-lg text-display-lg text-on-surface">0</span>
<span class="material-symbols-outlined text-[20px] font-bold">attach_money</span>
</div>
</div>
<div class="p-2.5 rounded-full bg-surface-container">
<span class="material-symbols-outlined text-on-surface-variant">attach_money</span>
</div>
</div>
<!-- Due Invoice -->
<div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center justify-between group hover:shadow-sm transition-shadow">
<div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Due Invoice</p>
<div class="flex items-center gap-1">
<span class="font-display-lg text-display-lg text-on-surface">0</span>
<span class="material-symbols-outlined text-[20px] font-bold">attach_money</span>
</div>
</div>
<div class="p-2.5 rounded-full bg-surface-container">
<span class="material-symbols-outlined text-on-surface-variant">attach_money</span>
</div>
</div>
<!-- Due Purchase -->
<div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center justify-between group hover:shadow-sm transition-shadow">
<div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Due Purchase</p>
<div class="flex items-center gap-1">
<span class="font-display-lg text-display-lg text-on-surface">0</span>
<span class="material-symbols-outlined text-[20px] font-bold">attach_money</span>
</div>
</div>
<div class="p-2.5 rounded-full bg-surface-container">
<span class="material-symbols-outlined text-on-surface-variant">attach_money</span>
</div>
</div>
<!-- Monthly Revenue -->
<div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center justify-between group hover:shadow-sm transition-shadow">
<div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-1">Monthly Revenue</p>
<div class="flex items-center gap-1">
<span class="font-display-lg text-display-lg text-on-surface">0</span>
<span class="material-symbols-outlined text-[20px] font-bold">attach_money</span>
</div>
</div>
<div class="p-2.5 rounded-full bg-surface-container">
<span class="material-symbols-outlined text-on-surface-variant">attach_money</span>
</div>
</div>
</div>
<!-- KPI Row 2: Secondary metric cards matching IMAGE_6 -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl">
<!-- Suppliers (Blue) -->
<div class="bg-[#4299e1] p-lg rounded-xl flex items-center justify-between text-white">
<div>
<p class="font-display-lg text-display-lg mb-1">0</p>
<p class="font-body-base text-body-base opacity-90">Suppliers</p>
</div>
<span class="material-symbols-outlined text-[48px] opacity-60">handshake</span>
</div>
<!-- Purchase Due Invoice (Dark) -->
<div class="bg-[#2d3748] p-lg rounded-xl flex items-center justify-between text-white">
<div>
<p class="font-display-lg text-display-lg mb-1">0</p>
<p class="font-body-base text-body-base opacity-90">Purchase Due Invoice</p>
</div>
<span class="material-symbols-outlined text-[48px] opacity-60">description</span>
</div>
<!-- Sales Due Invoice (Green) -->
<div class="bg-[#38a169] p-lg rounded-xl flex items-center justify-between text-white">
<div>
<p class="font-display-lg text-display-lg mb-1">0</p>
<p class="font-body-base text-body-base opacity-90">Sales Due Invoice</p>
</div>
<span class="material-symbols-outlined text-[48px] opacity-60">description</span>
</div>
</div>
<!-- Main Chart Section: Sale in 30 days -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col mb-xl">
<div class="p-lg border-b border-outline-variant">
<h3 class="font-headline-md text-headline-md text-on-surface">Sale in 30 days</h3>
</div>
<div class="flex-1 p-xl flex items-center justify-center min-h-[400px]">
<div class="text-center">
<span class="material-symbols-outlined text-[64px] text-outline-variant mb-md">bar_chart_off</span>
<p class="font-body-base text-body-base text-on-surface-variant">No sales in the last 30 days.</p>
</div>
</div>
</div>
<!-- Recent Transactions Table -->
<div class="mt-gutter bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
<div class="p-lg border-b border-outline-variant flex justify-between items-center">
<h3 class="font-headline-md text-headline-md text-on-surface">Recent Sales Transactions</h3>
<button class="text-secondary font-title-sm hover:underline">View All Sales</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left">
<thead class="bg-surface-container-low border-b border-outline-variant">
<tr>
<th class="px-lg py-3 font-label-caps text-on-surface-variant uppercase">Invoice ID</th>
<th class="px-lg py-3 font-label-caps text-on-surface-variant uppercase">Customer</th>
<th class="px-lg py-3 font-label-caps text-on-surface-variant uppercase">Status</th>
<th class="px-lg py-3 font-label-caps text-on-surface-variant uppercase">Date</th>
<th class="px-lg py-3 font-label-caps text-on-surface-variant uppercase text-right">Amount</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant text-on-surface">
<tr class="hover:bg-primary/5 transition-colors cursor-pointer">
<td class="px-lg py-4 font-data-tabular">#INV-98210</td>
<td class="px-lg py-4 font-body-base">Summit Retail Group</td>
<td class="px-lg py-4">
<span class="px-2 py-1 rounded bg-green-100 text-green-700 font-label-caps text-[10px] uppercase">Paid</span>
</td>
<td class="px-lg py-4 font-body-sm text-on-surface-variant">24 May 2024, 11:32 AM</td>
<td class="px-lg py-4 font-data-tabular text-right">$1,240.00</td>
</tr>
<tr class="hover:bg-primary/5 transition-colors cursor-pointer">
<td class="px-lg py-4 font-data-tabular">#INV-98209</td>
<td class="px-lg py-4 font-body-base">Urban Styles Co.</td>
<td class="px-lg py-4">
<span class="px-2 py-1 rounded bg-amber-100 text-amber-700 font-label-caps text-[10px] uppercase">Pending</span>
</td>
<td class="px-lg py-4 font-body-sm text-on-surface-variant">24 May 2024, 10:15 AM</td>
<td class="px-lg py-4 font-data-tabular text-right">$850.50</td>
</tr>
</tbody>
</table>
</div>
</div>
</main>
<!-- Contextual FAB -->
<button class="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-50">
<span class="material-symbols-outlined text-[30px]">add_shopping_cart</span>
<span class="absolute right-full mr-4 px-3 py-1 bg-primary text-on-primary text-body-sm whitespace-nowrap rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">New Quick Sale</span>
</button>
</body></html>

<!-- Suppliers - Master POS -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Master POS - Supplier List</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-surface": "#0b1c30",
                    "inverse-surface": "#213145",
                    "on-surface-variant": "#45464d",
                    "tertiary-fixed": "#6ffbbe",
                    "error": "#ba1a1a",
                    "on-secondary": "#ffffff",
                    "on-primary-container": "#7c839b",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f8f9ff",
                    "on-error-container": "#93000a",
                    "background": "#f8f9ff",
                    "secondary-container": "#2170e4",
                    "on-tertiary-container": "#009668",
                    "on-error": "#ffffff",
                    "error-container": "#ffdad6",
                    "secondary-fixed-dim": "#adc6ff",
                    "inverse-on-surface": "#eaf1ff",
                    "secondary": "#0058be",
                    "surface-tint": "#565e74",
                    "secondary-fixed": "#d8e2ff",
                    "primary-fixed-dim": "#bec6e0",
                    "on-secondary-container": "#fefcff",
                    "tertiary": "#000000",
                    "surface-container-highest": "#d3e4fe",
                    "on-tertiary-fixed": "#002113",
                    "surface-container-high": "#dce9ff",
                    "on-background": "#0b1c30",
                    "surface": "#f8f9ff",
                    "surface-container": "#e5eeff",
                    "on-primary-fixed-variant": "#3f465c",
                    "tertiary-fixed-dim": "#4edea3",
                    "surface-dim": "#cbdbf5",
                    "on-secondary-fixed": "#001a42",
                    "on-secondary-fixed-variant": "#004395",
                    "outline-variant": "#c6c6cd",
                    "tertiary-container": "#002113",
                    "primary": "#000000",
                    "outline": "#76777d",
                    "primary-container": "#131b2e",
                    "on-primary": "#ffffff",
                    "on-tertiary": "#ffffff",
                    "surface-container-low": "#eff4ff",
                    "primary-fixed": "#dae2fd",
                    "on-tertiary-fixed-variant": "#005236",
                    "on-primary-fixed": "#131b2e",
                    "inverse-primary": "#bec6e0",
                    "surface-variant": "#d3e4fe"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "xs": "4px",
                    "lg": "24px",
                    "container-margin": "24px",
                    "base-unit": "4px",
                    "xl": "32px",
                    "sm": "8px",
                    "md": "16px",
                    "gutter": "16px"
            },
            "fontFamily": {
                    "headline-md": ["Hanken Grotesk"],
                    "label-caps": ["Hanken Grotesk"],
                    "display-lg": ["Hanken Grotesk"],
                    "body-base": ["Hanken Grotesk"],
                    "title-sm": ["Hanken Grotesk"],
                    "data-tabular": ["Hanken Grotesk"],
                    "body-sm": ["Hanken Grotesk"]
            },
            "fontSize": {
                    "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                    "display-lg": ["30px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "body-base": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "title-sm": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
                    "data-tabular": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
                    "body-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
        }
        body {
            font-family: 'Hanken Grotesk', sans-serif;
            background-color: #f8f9ff;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="text-on-surface">
<!-- SideNavBar -->
<aside class="flex flex-col h-screen fixed left-0 top-0 overflow-y-auto bg-surface-container-low border-r border-outline-variant w-[260px] z-50">
<div class="p-lg flex items-center gap-md">
<div class="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-on-secondary">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">inventory</span>
</div>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-on-surface">Master POS</h1>
<p class="font-body-sm text-body-sm text-on-surface-variant">Enterprise Admin</p>
</div>
</div>
<nav class="flex-1 mt-md">
<!-- Navigation Items Mapping -->
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-title-sm text-title-sm">Dashboard</span>
</a>
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-title-sm text-title-sm">Products</span>
</a>
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">category</span>
<span class="font-title-sm text-title-sm">Categories</span>
</a>
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-colors text-secondary font-semibold bg-secondary-container/10" href="#">
<span class="material-symbols-outlined">local_shipping</span>
<span class="font-title-sm text-title-sm">Suppliers</span>
</a>
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">assignment</span>
<span class="font-title-sm text-title-sm">Inventory</span>
</a>
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">analytics</span>
<span class="font-title-sm text-title-sm">Sales Reports</span>
</a>
<div class="mt-auto pb-lg">
<a class="flex items-center gap-md py-md px-lg cursor-pointer transition-all hover:bg-surface-container-high text-on-surface-variant" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-title-sm text-title-sm">Settings</span>
</a>
</div>
</nav>
</aside>
<!-- Main Content Shell -->
<main class="ml-[260px] min-h-screen flex flex-col">
<!-- TopNavBar -->
<header class="flex justify-between items-center h-16 px-lg w-full sticky top-0 z-50 bg-surface border-b border-outline-variant">
<div class="flex items-center flex-1 max-w-xl">
<div class="relative w-full">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-body-base text-body-base" placeholder="Search suppliers, contacts, or business IDs..." type="text"/>
</div>
</div>
<div class="flex items-center gap-md">
<button class="p-2 hover:bg-surface-container-low rounded-full transition-colors relative">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="p-2 hover:bg-surface-container-low rounded-full transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">help_outline</span>
</button>
<div class="h-8 w-[1px] bg-outline-variant mx-sm"></div>
<div class="flex items-center gap-sm cursor-pointer hover:bg-surface-container-low p-1 rounded-lg transition-colors">
<div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
<img class="w-full h-full object-cover" data-alt="A professional headshot of a senior system administrator in a high-tech corporate office. The lighting is crisp and cool-toned, matching a modern enterprise aesthetic. The background is slightly blurred showing glass partitions and soft digital screens." src="https://lh3.googleusercontent.com/aida-public/AB6AXuChofTsLNcvFECNq0oyLBNL5ebnQQNbcXjbOZc6W1x-0o1QK6TRRgt267hf2Deo1rTie-DPXUAQpQJWLM2Tvfryb74UTQ3VfHnhQaaa5spDRMGxfXE8oraRscH0FszHVpmtGe1H0ZNtwNvWjI1vhOHMq9mCGrfenj9w0eXlQgUfvPGcy0Iw6gihrIzn-pg0U2L_baqIsDfGYCndLmjVKTNsCyJqB70j7VSTW0sGY1dXOOoZqyFlsd--93uMBevBj9sh_ea5gH4_YM0B"/>
</div>
<span class="font-body-base text-body-base font-semibold text-on-surface">Admin User</span>
</div>
</div>
</header>
<!-- Content Canvas -->
<div class="p-lg flex-1">
<!-- Page Header -->
<div class="flex justify-between items-end mb-xl">
<div>
<h2 class="font-display-lg text-display-lg text-on-surface tracking-tight">Suppliers</h2>
<p class="font-body-base text-body-base text-on-surface-variant mt-xs">Manage and monitor your supply chain network and vendor relationships.</p>
</div>
<button class="flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-lg font-title-sm text-title-sm hover:opacity-90 transition-opacity active:scale-[0.98]">
<span class="material-symbols-outlined">add</span>
                    + Add Supplier
                </button>
</div>
<!-- Dashboard Stats Preview (Consistency with context) -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
<div class="bg-surface border border-outline-variant p-lg rounded-xl">
<div class="flex items-center gap-md mb-sm">
<div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined">groups</span>
</div>
<span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Suppliers</span>
</div>
<div class="font-display-lg text-display-lg">0</div>
</div>
<div class="bg-surface border border-outline-variant p-lg rounded-xl">
<div class="flex items-center gap-md mb-sm">
<div class="w-10 h-10 rounded-full bg-on-tertiary-container/10 flex items-center justify-center text-on-tertiary-container">
<span class="material-symbols-outlined">verified</span>
</div>
<span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Vendors</span>
</div>
<div class="font-display-lg text-display-lg">0</div>
</div>
<div class="bg-surface border border-outline-variant p-lg rounded-xl">
<div class="flex items-center gap-md mb-sm">
<div class="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
<span class="material-symbols-outlined">pending_actions</span>
</div>
<span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Pending Orders</span>
</div>
<div class="font-display-lg text-display-lg">0</div>
</div>
<div class="bg-surface border border-outline-variant p-lg rounded-xl">
<div class="flex items-center gap-md mb-sm">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface">
<span class="material-symbols-outlined">receipt_long</span>
</div>
<span class="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Payable</span>
</div>
<div class="font-display-lg text-display-lg">$0.00</div>
</div>
</div>
<!-- Table Container -->
<div class="bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col min-h-[400px]">
<!-- Table Header Controls -->
<div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
<div class="flex items-center gap-sm">
<span class="font-body-sm text-body-sm text-on-surface-variant">Showing 0 results</span>
</div>
<div class="flex items-center gap-md">
<div class="flex border border-outline-variant rounded-lg overflow-hidden">
<button class="p-2 hover:bg-surface-container-low transition-colors border-r border-outline-variant">
<span class="material-symbols-outlined text-[20px]">filter_list</span>
</button>
<button class="p-2 hover:bg-surface-container-low transition-colors">
<span class="material-symbols-outlined text-[20px]">file_download</span>
</button>
</div>
</div>
</div>
<!-- Table Content -->
<div class="overflow-x-auto flex-1">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low">
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">N.o</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Business Name</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Name</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Phone</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Address</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Note</th>
<th class="px-lg py-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Actions</th>
</tr>
</thead>
<tbody>
<!-- No Suppliers Found State -->
<tr>
<td class="py-24 text-center" colspan="7">
<div class="flex flex-col items-center justify-center gap-md">
<div class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-4xl text-outline-variant">inventory</span>
</div>
<div class="space-y-1">
<h3 class="font-title-sm text-title-sm text-on-surface">No suppliers found</h3>
<p class="font-body-base text-body-base text-on-surface-variant">You haven't registered any suppliers yet. Get started by adding your first business partner.</p>
</div>
<button class="mt-md px-lg py-2 border border-outline text-on-surface font-title-sm text-title-sm rounded-lg hover:bg-surface-container-low transition-colors">
                                            + Add Your First Supplier
                                        </button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Pagination Footer -->
<div class="p-lg border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
<div class="flex items-center gap-md">
<button class="flex items-center gap-xs px-md py-2 rounded-lg border border-outline-variant text-outline-variant font-title-sm text-title-sm cursor-not-allowed" disabled="">
<span class="material-symbols-outlined">first_page</span>
                            &lt;&lt; Page 1 &gt;&gt;
                        </button>
<span class="font-body-sm text-body-sm text-on-surface-variant">Page 1 / 1</span>
</div>
<div class="flex items-center gap-xs">
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline-variant cursor-not-allowed" disabled="">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-secondary bg-secondary-container/10 text-secondary font-bold">1</button>
<button class="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline-variant cursor-not-allowed" disabled="">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Ambient background effect -->
<div class="fixed bottom-0 right-0 w-1/2 h-1/2 pointer-events-none z-[-1] opacity-30">

</div>
</div>
</main>
<!-- Simple Micro-interactions Script -->
<script>
        // Placeholder for future interactivity
        document.querySelectorAll('button:not([disabled])').forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.98)';
            });
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
        });

        // Search Input focus effect
        const searchInput = document.querySelector('input[type="text"]');
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('ring-2', 'ring-secondary/20');
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('ring-2', 'ring-secondary/20');
        });
    </script>

</body></html>

<!-- Create Supplier - Master POS -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Master POS - Create New Supplier</title>
<!-- Google Fonts: Hanken Grotesk -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-surface": "#0b1c30",
                        "inverse-surface": "#213145",
                        "on-surface-variant": "#45464d",
                        "tertiary-fixed": "#6ffbbe",
                        "error": "#ba1a1a",
                        "on-secondary": "#ffffff",
                        "on-primary-container": "#7c839b",
                        "surface-container-lowest": "#ffffff",
                        "surface-bright": "#f8f9ff",
                        "on-error-container": "#93000a",
                        "background": "#f8f9ff",
                        "secondary-container": "#2170e4",
                        "on-tertiary-container": "#009668",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "secondary-fixed-dim": "#adc6ff",
                        "inverse-on-surface": "#eaf1ff",
                        "secondary": "#0058be",
                        "surface-tint": "#565e74",
                        "secondary-fixed": "#d8e2ff",
                        "primary-fixed-dim": "#bec6e0",
                        "on-secondary-container": "#fefcff",
                        "tertiary": "#000000",
                        "surface-container-highest": "#d3e4fe",
                        "on-tertiary-fixed": "#002113",
                        "surface-container-high": "#dce9ff",
                        "on-background": "#0b1c30",
                        "surface": "#f8f9ff",
                        "surface-container": "#e5eeff",
                        "on-primary-fixed-variant": "#3f465c",
                        "tertiary-fixed-dim": "#4edea3",
                        "surface-dim": "#cbdbf5",
                        "on-secondary-fixed": "#001a42",
                        "on-secondary-fixed-variant": "#004395",
                        "outline-variant": "#c6c6cd",
                        "tertiary-container": "#002113",
                        "primary": "#000000",
                        "outline": "#76777d",
                        "primary-container": "#131b2e",
                        "on-primary": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "surface-container-low": "#eff4ff",
                        "primary-fixed": "#dae2fd",
                        "on-tertiary-fixed-variant": "#005236",
                        "on-primary-fixed": "#131b2e",
                        "inverse-primary": "#bec6e0",
                        "surface-variant": "#d3e4fe"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "xs": "4px",
                        "lg": "24px",
                        "container-margin": "24px",
                        "base-unit": "4px",
                        "xl": "32px",
                        "sm": "8px",
                        "md": "16px",
                        "gutter": "16px"
                    },
                    "fontFamily": {
                        "headline-md": ["Hanken Grotesk"],
                        "label-caps": ["Hanken Grotesk"],
                        "display-lg": ["Hanken Grotesk"],
                        "body-base": ["Hanken Grotesk"],
                        "title-sm": ["Hanken Grotesk"],
                        "data-tabular": ["Hanken Grotesk"],
                        "body-sm": ["Hanken Grotesk"]
                    },
                    "fontSize": {
                        "headline-md": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                        "display-lg": ["30px", {"lineHeight": "38px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "body-base": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "title-sm": ["16px", {"lineHeight": "24px", "fontWeight": "600"}],
                        "data-tabular": ["14px", {"lineHeight": "20px", "fontWeight": "500"}],
                        "body-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}]
                    }
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Hanken Grotesk', sans-serif;
            background-color: #f8f9ff;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        /* Custom scrollbar for side nav */
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
    </style>
</head>
<body class="text-on-surface">
<!-- TopNavBar (Execution from JSON) -->
<header class="bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-lg w-full sticky top-0 z-50">
<div class="flex items-center gap-md">
<span class="font-headline-md text-headline-md font-bold text-on-surface">Master POS</span>
<div class="ml-xl flex gap-lg">
<a class="font-body-base text-body-base text-secondary font-semibold border-b-2 border-secondary h-16 flex items-center" href="#">Suppliers</a>
<a class="font-body-base text-body-base text-on-surface-variant hover:bg-surface-container-low transition-colors h-16 flex items-center px-sm" href="#">Dashboard</a>
<a class="font-body-base text-body-base text-on-surface-variant hover:bg-surface-container-low transition-colors h-16 flex items-center px-sm" href="#">Inventory</a>
</div>
</div>
<div class="flex items-center gap-md">
<div class="flex items-center bg-surface-container rounded-full px-md py-xs w-64 border border-outline-variant">
<span class="material-symbols-outlined text-outline">search</span>
<input class="bg-transparent border-none focus:ring-0 text-body-sm w-full" placeholder="Search suppliers..." type="text"/>
</div>
<button class="p-xs hover:bg-surface-container-low rounded-full transition-colors">
<span class="material-symbols-outlined text-secondary">notifications</span>
</button>
<button class="p-xs hover:bg-surface-container-low rounded-full transition-colors">
<span class="material-symbols-outlined text-secondary">help_outline</span>
</button>
<div class="h-8 w-8 rounded-full bg-secondary-container overflow-hidden ml-sm">
<img class="h-full w-full object-cover" data-alt="A professional headshot of a senior administrator in a minimalist office environment, soft high-key lighting, corporate professional attire, neutral blue and grey background palette to match the Master POS design system." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNWMDRedYl5XxJs-Kfz3vCxetpUJubzqo2Lf3ZxwfOuJ5ym-IfnJMwKztd2Tfd6GoyUNMi13w_hzMech2TiDS1aeTb74zXP3GfPpW6wBy0G9cw2hTcmEvj2gUViS6pWqUXZlznHAXBIfDtvTGTk5sRiBwqtjj0vMQk-NihjSz6wb4dT01JXHEEcnAO7Oelz75iEZZIHmboqcBLotm-zlstDUS-Dz8as6yRe7jJ5dLz8PBSOpCQNI4N88yyxIR50rJILf26exIAA_fz"/>
</div>
</div>
</header>
<div class="flex min-h-screen">
<!-- SideNavBar (Execution from JSON) -->
<aside class="flex flex-col h-screen fixed left-0 top-0 overflow-y-auto w-[260px] bg-surface-container-low border-r border-outline-variant sidebar-scroll z-40 hidden md:flex">
<div class="p-lg flex flex-col gap-xs mb-md mt-16">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-primary" style="font-variation-settings: 'FILL' 1;">storefront</span>
</div>
<div>
<p class="font-title-sm text-title-sm text-on-surface leading-tight">Master POS</p>
<p class="text-[10px] uppercase tracking-widest text-outline">Enterprise Admin</p>
</div>
</div>
</div>
<nav class="flex flex-col gap-xs px-sm">
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg">
<span class="material-symbols-outlined group-hover:text-secondary">dashboard</span>
<span class="font-title-sm text-title-sm">Dashboard</span>
</div>
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg">
<span class="material-symbols-outlined group-hover:text-secondary">inventory_2</span>
<span class="font-title-sm text-title-sm">Products</span>
</div>
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg">
<span class="material-symbols-outlined group-hover:text-secondary">category</span>
<span class="font-title-sm text-title-sm">Categories</span>
</div>
<!-- ACTIVE TAB: Suppliers -->
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-secondary font-semibold bg-secondary-container/10 rounded-lg">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">local_shipping</span>
<span class="font-title-sm text-title-sm">Suppliers</span>
</div>
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg">
<span class="material-symbols-outlined group-hover:text-secondary">assignment</span>
<span class="font-title-sm text-title-sm">Inventory</span>
</div>
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg">
<span class="material-symbols-outlined group-hover:text-secondary">analytics</span>
<span class="font-title-sm text-title-sm">Sales Reports</span>
</div>
<div class="flex items-center gap-md py-md px-lg cursor-pointer transition-all text-on-surface-variant hover:bg-surface-container-high group rounded-lg mt-xl">
<span class="material-symbols-outlined group-hover:text-secondary">settings</span>
<span class="font-title-sm text-title-sm">Settings</span>
</div>
</nav>
</aside>
<!-- Main Content Canvas -->
<main class="flex-1 md:ml-[260px] p-lg">
<div class="max-w-[1440px] mx-auto">
<!-- Breadcrumbs / Header -->
<div class="mb-xl flex justify-between items-end">
<div>
<div class="flex items-center gap-xs text-on-surface-variant text-body-sm mb-xs">
<span>Suppliers</span>
<span class="material-symbols-outlined text-[16px]">chevron_right</span>
<span class="text-secondary font-medium">Create New</span>
</div>
<h1 class="font-display-lg text-display-lg text-on-surface">Add Supplier</h1>
</div>
</div>
<div class="grid grid-cols-12 gap-lg">
<!-- Form Container (Left Column) -->
<div class="col-span-12 lg:col-span-8">
<div class="bg-white border border-outline-variant rounded-xl overflow-hidden">
<div class="p-lg border-b border-outline-variant flex items-center justify-between">
<h2 class="font-headline-md text-headline-md">Create New Supplier</h2>
<span class="text-body-sm text-on-surface-variant italic">* Required fields</span>
</div>
<form class="p-lg space-y-lg">
<div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
<!-- Business Name -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">BUSINESS NAME*</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">corporate_fare</span>
<input class="w-full pl-xl pr-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base" placeholder="e.g. Acme Corp Wholesale" type="text"/>
</div>
</div>
<!-- Name -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">CONTACT NAME*</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">person</span>
<input class="w-full pl-xl pr-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base" placeholder="e.g. John Doe" type="text"/>
</div>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
<!-- Phone -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">PHONE NUMBER</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">call</span>
<input class="w-full pl-xl pr-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base" placeholder="+1 (555) 000-0000" type="tel"/>
</div>
</div>
<!-- Category Select (Custom Addition for Fidelity) -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">SUPPLY CATEGORY</label>
<select class="w-full px-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base appearance-none bg-no-repeat bg-[right_16px_center]">
<option>General Electronics</option>
<option>Raw Materials</option>
<option>Logistics &amp; Shipping</option>
<option>Office Supplies</option>
</select>
</div>
</div>
<!-- Address -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">BUSINESS ADDRESS</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-sm top-md text-outline">location_on</span>
<textarea class="w-full pl-xl pr-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base" placeholder="Enter full street address, city, and zip..." rows="3"></textarea>
</div>
</div>
<!-- Note -->
<div class="space-y-xs">
<label class="font-label-caps text-label-caps text-on-surface-variant block">INTERNAL NOTES</label>
<div class="relative">
<span class="material-symbols-outlined absolute left-sm top-md text-outline">description</span>
<textarea class="w-full pl-xl pr-md py-md border border-outline-variant rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all font-body-base" placeholder="Additional details, credit terms, or delivery preferences..." rows="4"></textarea>
</div>
</div>
<!-- Form Actions -->
<div class="pt-lg flex items-center justify-end gap-md border-t border-outline-variant">
<button class="px-xl py-md rounded-lg font-title-sm text-title-sm border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all" type="button">
                                        Cancel
                                    </button>
<button class="px-xl py-md rounded-lg font-title-sm text-title-sm bg-primary text-on-primary hover:bg-primary/90 shadow-sm transition-all flex items-center gap-sm" type="submit">
<span class="material-symbols-outlined text-[18px]">save</span>
                                        Save Supplier
                                    </button>
</div>
</form>
</div>
</div>
<!-- Side Info / Reference (Right Column) -->
<div class="col-span-12 lg:col-span-4 space-y-lg">
<!-- Visual Reference Card -->
<div class="bg-white border border-outline-variant rounded-xl overflow-hidden">
<div class="h-48 relative">
<img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZcmZKGSaVd1GYHId2z1o3H0cKQs1JtQd2We3TxDizXfXp8ECb76Rc27mgOCedpiA89MnmLLk1m2cY5_A4QID_rJlkDuutC55Q56wHFlrbipy0t9NKizpx9IgxTs_7_4Jz4mCI7QWEMVDE8sV-H-_H0O1jq3UE-XAfd1gH5n7LAcAQtGMG3B_4JrjBKize0PLrByil54rP4mSUA3416D0bCWH3tNrv0lbYiVnTd1VxZekEo1X1bcnvbaorUKDvtsMjdWPiiO4UJ3op"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-md">
<span class="text-white font-title-sm">Supply Chain Hub</span>
</div>
</div>
<div class="p-md space-y-sm">
<p class="font-body-base text-body-base text-on-surface-variant">
                                    Managing your supplier network effectively reduces operational overhead. Ensure accurate data for seamless inventory replenishment.
                                </p>
</div>
</div>
<!-- Data Density KPI Card -->
<div class="bg-surface-container-high border border-outline-variant rounded-xl p-lg">
<div class="flex items-center gap-md mb-md">
<div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
<span class="material-symbols-outlined text-on-secondary-fixed">info</span>
</div>
<h3 class="font-headline-md text-headline-md">Quick Tips</h3>
</div>
<ul class="space-y-md">
<li class="flex gap-sm">
<span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
<p class="text-body-sm">Include country codes for international suppliers.</p>
</li>
<li class="flex gap-sm">
<span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
<p class="text-body-sm">Notes are only visible to administrators.</p>
</li>
<li class="flex gap-sm">
<span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
<p class="text-body-sm">Tax IDs can be added later in the verification tab.</p>
</li>
</ul>
</div>
</div>
</div>
</div>
</main>
</div>
<!-- Micro-interaction Script -->
<script>
        document.addEventListener('DOMContentLoaded', () => {
            const inputs = document.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    const icon = input.parentElement.querySelector('.material-symbols-outlined');
                    if(icon) {
                        icon.classList.remove('text-outline');
                        icon.classList.add('text-secondary');
                        icon.style.transition = 'color 0.2s ease';
                    }
                });
                
                input.addEventListener('blur', () => {
                    const icon = input.parentElement.querySelector('.material-symbols-outlined');
                    if(icon) {
                        icon.classList.remove('text-secondary');
                        icon.classList.add('text-outline');
                    }
                });
            });

            // Form Submit Simulation
            const form = document.querySelector('form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const saveBtn = form.querySelector('button[type="submit"]');
                const originalText = saveBtn.innerHTML;

                saveBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Saving...';
                saveBtn.disabled = true;
                saveBtn.classList.add('opacity-70');

                setTimeout(() => {
                    saveBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Success';
                    saveBtn.classList.remove('bg-primary');
                    saveBtn.classList.add('bg-on-tertiary-container');

                    setTimeout(() => {
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                        saveBtn.classList.remove('opacity-70', 'bg-on-tertiary-container');
                        saveBtn.classList.add('bg-primary');
                    }, 2000);
                }, 1200);
            });
        });
    </script>

</body></html>
