# FinGuard Frontend

This is the React + TypeScript frontend for the FinGuard financial risk monitoring platform.

## App overview

The frontend allows users to:
- sign in and manage secure access
- view the dashboard summary
- create and manage custom transaction risk scenarios
- review alerts by status and severity
- inspect transaction details for investigation workflows

## Screenshots

### Dashboard

![Dashboard](../../docs/imgs/Dashboard.png)

The dashboard gives an overview of total alerts, unresolved items, and active scenarios.

### Alerts

![Alerts Page](../../docs/imgs/alerts%20page.png)

The alert screen helps users review triggered events and filter the list by severity or date.

### Scenario Builder

![Scenario Builder](../../docs/imgs/senerio%20page.png)

This builder is used to create custom rules such as blocked countries, blocked transaction types, and amount thresholds.

### Create Scenario

![Create Scenario](../../docs/imgs/create%20Senerio.png)

Users can define new risk scenarios and assign severity levels before activating them.

### Alert Details

![Alert Details](../../docs/imgs/View%20alert%20details.png)

The detail view shows the exact reason an alert fired and the transaction context for investigation.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
