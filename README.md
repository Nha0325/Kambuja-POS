# Kambuja POS

## Overview
Kambuja POS is a comprehensive Point of Sale (POS) and Inventory Management platform designed specifically to streamline the daily operations of small retail shops, convenience stores, and mini markets.

## Project Purpose & Business Use Case
The primary goal of Kambuja POS is to empower small and medium-sized businesses with a robust, digital ecosystem to manage their retail flow. By replacing traditional ledger books and disjointed software, Kambuja POS provides an all-in-one centralized system. 

Store owners can effortlessly track real-time stock levels, monitor daily sales, manage supplier relationships, and handle purchasing directly from suppliers. Meanwhile, staff can rely on a fast, responsive POS screen to check out customers seamlessly. The system eliminates stock-outs via automated low-stock alerts and ensures business transparency through detailed reporting and system auditing logs.

## Role-Based Access
Kambuja POS operates on a strict multi-tier role-based access control system to ensure data security and operational hierarchy:

- **Admin Manager:** The highest level of access. This role is responsible for the overall platform administration, monitoring system health, reviewing system logs, and managing shop subscriptions across the entire platform.
- **Admin:** The shop owner or store manager. Admins have full control over their specific shop's operations. They manage the product catalog, oversee inventory and stock movements, handle supplier and customer data, analyze sales reports, and create cashier accounts.
- **Cashier:** The frontline retail staff. Cashiers have restricted access focused purely on customer transactions. They operate the POS interface, process sales, search for products via barcode/QR code, and generate receipts or invoices.

## Main Modules & Features
- **Point of Sale (POS):** Fast, responsive checkout interface tailored for cashiers.
- **Inventory Management:** Full product and category tracking with barcode/QR lookup support.
- **Stock Control:** Dedicated stock-in/movement tracking and automated low stock alerts.
- **Sales & Purchasing:** Comprehensive workflows for managing customer sales and supplier purchases.
- **Reporting & Analytics:** Financial insights, daily sales reports, and general business metrics.
- **System Auditing:** Detailed system logs tracking user actions and critical business events.
- **Notification System:** Built-in alerts (with Telegram service integration support) for immediate business updates.

## Tech Stack
Kambuja POS is built using a modern, scalable JavaScript stack:
- **Frontend:** React, Vite, Tailwind CSS (Single Page Application architecture)
- **Backend:** Node.js, Express (RESTful API architecture)
- **Database:** MongoDB (NoSQL document storage)

## Security & Git Safety Notes
- **Environment Variables:** This project relies on `.env` files for configuration. Do **not** commit real secrets, API keys, or database URIs to version control. Always use the `.env.example` templates provided.
- **Tracking:** Keep your `.env`, `Frontend/.env`, and `Backend/.env` files out of Git tracking. Ensure that `package-lock.json` remains tracked for dependency consistency.

## Local LAN Testing & Mobile Scanning
When testing the POS application on a mobile device over a local Wi-Fi network (LAN IP like `10.91.x.x`):
- Phone browser camera does not work reliably on `http://LAN_IP` because `getUserMedia` requires a secure context.
- Use HTTPS domain/tunnel for correct testing.
- Example correct URLs:
  - `https://pos.kambujapos.com/cashier/pos`
  - `https://api.kambujapos.com/api/v1`

**Quick test workaround for Brave/Chrome:**
1. Open `brave://flags` or `chrome://flags`
2. Search for "Insecure origins treated as secure"
3. Add your local IP with port (e.g., `http://10.91.21.48:5174`)
4. Enable and relaunch the browser

**Hardware Scanners**: Standard USB/Bluetooth barcode scanners operating in keyboard-emulation mode will continue to work perfectly fine regardless of HTTPS.
