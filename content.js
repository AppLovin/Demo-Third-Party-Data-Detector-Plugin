// Create dashboard with inline table styling
const dashboard = document.createElement('div');
dashboard.id = 'data-tracking-dashboard';
dashboard.style.cssText = `
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 200px;
    width: calc(100% - 210px);
    background: rgb(0, 0, 0);
    color: white;
    padding: 5px 10px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
`;

dashboard.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th style="padding: 5px; text-align: left;">Identifier</th>
                <th style="padding: 5px; text-align: left;">Value</th>
                <th style="padding: 5px; text-align: left;">Domains</th>
            </tr>
        </thead>
        <tbody id="tracking-table-body"></tbody>
    </table>
`;

document.body.appendChild(dashboard);

// Handle dashboard updates and domain click-to-copy
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'updateDashboard') {
        const tbody = document.getElementById('tracking-table-body');
        tbody.innerHTML = `
            <tr style="border-bottom: 1px solid #444; user-select: text;color: white">
                <td style="padding: 5px;">Facebook ID</td>
                <td style="padding: 5px;">${message.fbId}</td>
                <td style="padding: 5px;">${message.fbDomains.map(([domain, request]) =>
            `<span style="cursor: pointer; color: #0ff;" class="copy-domain" data-request="${encodeURIComponent(request)}">${domain}</span>`
        ).join(', ')}</td>
            </tr>
            <tr style="user-select: text;color: white">
                <td style="padding: 5px;">GTM ID</td>
                <td style="padding: 5px;">${message.gtmId}</td>
                <td style="padding: 5px;">${message.gtmDomains.map(([domain, request]) =>
            `<span style="cursor: pointer; color: #0ff;" class="copy-domain" data-request="${encodeURIComponent(request)}">${domain}</span>`
        ).join(', ')}</td>
            </tr>
        `;
        
        // Add click handlers for copying individual domain requests
        document.querySelectorAll('.copy-domain').forEach(span => {
            span.addEventListener('click', async () => {
                const requestText = decodeURIComponent(span.dataset.request);
                try {
                    await navigator.clipboard.writeText(requestText);
                    span.style.color = '#0f0';
                    setTimeout(() => span.style.color = '#0ff', 500);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            });
        });
    }
});