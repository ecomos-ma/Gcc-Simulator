(() => {
  "use strict";

  const DEFAULTS = {
    platform: "codnetwork",
    country: "ksa",
    productType: "gadget",
    serviceMode: "with-center",
    leads: 100,
    costPerLead: 4,
    confirmation: 50,
    delivery: 45,
    price: 47,
    productCost: 5,
    parcelWeight: 1,
  };

  const PRODUCT_FEES = {
    gadget: { lead: 0.5, confirmed: 1, delivered: 2 },
    cosmetic: { lead: 0.5, confirmed: 2, delivered: 3 },
  };

  const NETWORK_MARKETS = {
    ksa: market("Saudi Arabia", "🇸🇦", "USD", 2.99, 4.99, 6.99, "Included"),
    uae: market("United Arab Emirates", "🇦🇪", "USD", 4.99, 5.99, 6.99, "Included"),
    bahrain: market("Bahrain", "🇧🇭", "USD", 5.99, 6.99, 7.99, "Included"),
    oman: market("Oman", "🇴🇲", "USD", 5.99, 6.99, 7.99, "Included"),
    kuwait: market("Kuwait", "🇰🇼", "USD", 5.99, 6.99, 7.99, "Included"),
    qatar: market("Qatar", "🇶🇦", "USD", 5.99, 6.99, 7.99, "Included"),
    morocco: {
      ...market("Morocco", "🇲🇦", "MAD", 9, 35, null, "Included", 0, 8),
      callCenter: {
        gadget: { lead: 2, confirmed: 4, delivered: 7 },
        cosmetic: { lead: 2, confirmed: 4, delivered: 7 },
      },
      codLabel: "Not listed",
      notice: "The supplied Morocco tariff does not list a separate COD percentage, so no extra COD percentage is added.",
    },
    spain: market("Spain", "🇪🇸", "EUR", 6.99, 7.99, null, "0%"),
    portugal: market("Portugal", "🇵🇹", "EUR", 6.99, 7.99, null, "0%"),
    poland: market("Poland", "🇵🇱", "EUR", 5.99, 6.99, null, "0%"),
    czechia: market("Czech Republic", "🇨🇿", "EUR", 6.99, 7.99, null, "0%"),
    hungary: market("Hungary", "🇭🇺", "EUR", 6.99, 7.99, null, "0%"),
    slovakia: market("Slovakia", "🇸🇰", "EUR", 6.99, 7.99, null, "0%"),
    romania: market("Romania", "🇷🇴", "EUR", 6.99, 7.99, null, "0%"),
    lithuania: market("Lithuania", "🇱🇹", "EUR", 6.99, 7.99, null, "0%"),
    slovenia: market("Slovenia", "🇸🇮", "EUR", 6.99, 7.99, null, "0%"),
    croatia: market("Croatia", "🇭🇷", "EUR", 6.99, 7.99, null, "0%"),
    latvia: market("Latvia", "🇱🇻", "EUR", 6.99, 7.99, null, "0%"),
    colombia: market("Colombia", "🇨🇴", "USD", 4.49, 4.49, null, "0%"),
    panama: market("Panama", "🇵🇦", "USD", 7.99, 7.99, null, "0%"),
    ecuador: market("Ecuador", "🇪🇨", "USD", 9, 9, null, "0%"),
  };

  const PARTNER_MARKETS = {
    uae: market("United Arab Emirates", "🇦🇪", "USD", 4.99, 4.99, null, "Not listed"),
    ksa: market("Saudi Arabia", "🇸🇦", "USD", 2.99, 4.99, null, "Not listed"),
    kuwait: market("Kuwait", "🇰🇼", "USD", 5.99, 5.99, null, "Not listed"),
    qatar: market("Qatar", "🇶🇦", "USD", 5.99, 5.99, null, "Not listed"),
    oman: market("Oman", "🇴🇲", "USD", 5.99, 5.99, null, "Not listed"),
    bahrain: market("Bahrain", "🇧🇭", "USD", 5.99, 5.99, null, "Not listed"),
    iraq: market("Iraq", "🇮🇶", "USD", 4.99, 4.99, null, "Not listed"),
  };

  const MARKET_GROUPS = {
    codnetwork: [
      { label: "GCC domestic", ids: ["ksa", "uae", "bahrain", "oman", "kuwait", "qatar"] },
      { label: "Morocco domestic", ids: ["morocco"] },
      { label: "Europe", ids: ["spain", "portugal", "poland", "czechia", "hungary", "slovakia", "romania", "lithuania", "slovenia", "croatia", "latvia"] },
      { label: "LATAM", ids: ["colombia", "panama", "ecuador"] },
    ],
    codpartner: [{ label: "GCC & Iraq", ids: ["uae", "ksa", "kuwait", "qatar", "oman", "bahrain", "iraq"] }],
  };

  const PLATFORM_META = {
    codnetwork: { name: "COD Network", source: "Fees loaded from the supplied COD Network dashboard." },
    codpartner: { name: "COD Partner", source: "Fees loaded from the supplied COD Partner pricing PDF." },
  };

  const confirmationScenarios = [35, 40, 45, 48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 66, 70, 75, 90, 100];
  const deliveryScenarios = [25, 30, 32, 35, 38, 40, 42, 44, 45, 47, 48, 49, 50, 52, 54, 55, 56, 57, 58, 59, 60, 65, 70, 75, 80, 100];

  const $ = (id) => document.getElementById(id);
  const platformSelect = $("platform");
  const countrySelect = $("country");
  const productTypeSelect = $("productType");
  const serviceModeSelect = $("serviceMode");
  const inputs = {
    leads: $("leads"),
    costPerLead: $("costPerLead"),
    confirmation: $("confirmation"),
    delivery: $("delivery"),
    price: $("price"),
    productCost: $("productCost"),
    parcelWeight: $("parcelWeight"),
  };
  const leadsRange = $("leadsRange");
  const confirmationRange = $("confirmationRange");
  const deliveryRange = $("deliveryRange");
  const matrixTable = $("matrixTable");

  function market(name, flag, currency, returned, delivered, noCallCenter, vat, codRate = 0.05, fulfillment = 0) {
    return { name, flag, currency, returned, delivered, noCallCenter, vat, codRate, fulfillment };
  }

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const displayCount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const currencySymbol = (currency) => ({ USD: "$", EUR: "€", MAD: "MAD" }[currency] || currency);
  const moneyFormatter = (currency) => new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = (value, currency) => moneyFormatter(currency).format(round2(value));
  const setText = (id, value) => { $(id).textContent = value; };

  function currentMarkets() {
    return platformSelect.value === "codpartner" ? PARTNER_MARKETS : NETWORK_MARKETS;
  }

  function currentMarket() {
    return currentMarkets()[countrySelect.value] || Object.values(currentMarkets())[0];
  }

  function updateCountryOptions(preferredCountry) {
    const platform = platformSelect.value;
    const markets = platform === "codpartner" ? PARTNER_MARKETS : NETWORK_MARKETS;
    const keep = preferredCountry || countrySelect.value;
    countrySelect.innerHTML = MARKET_GROUPS[platform].map((group) => {
      const options = group.ids.map((id) => `<option value="${id}">${markets[id].flag} ${markets[id].name}</option>`).join("");
      return `<optgroup label="${group.label}">${options}</optgroup>`;
    }).join("");
    countrySelect.value = markets[keep] ? keep : (platform === "codpartner" ? "ksa" : "ksa");
  }

  function updateServiceModes(preferredMode) {
    const platform = platformSelect.value;
    const marketData = currentMarket();
    let options;
    if (platform === "codpartner") {
      setText("serviceModeLabel", "COD Partner plan");
      options = [
        { value: "free", label: "Free Plan" },
        { value: "free-return", label: "Free Return Plan" },
      ];
    } else if (marketData.noCallCenter !== null) {
      setText("serviceModeLabel", "Service setup");
      options = [
        { value: "with-center", label: "With call center" },
        { value: "without-center", label: "Without call center" },
      ];
    } else {
      setText("serviceModeLabel", "Service setup");
      options = [{ value: "with-center", label: "Published tariff" }];
    }
    serviceModeSelect.innerHTML = options.map((option) => `<option value="${option.value}">${option.label}</option>`).join("");
    serviceModeSelect.value = options.some((option) => option.value === preferredMode) ? preferredMode : options[0].value;
  }

  function readInputs() {
    return {
      platform: platformSelect.value,
      country: countrySelect.value,
      productType: productTypeSelect.value,
      serviceMode: serviceModeSelect.value,
      leads: Math.max(0, safeNumber(inputs.leads.value)),
      costPerLead: Math.max(0, safeNumber(inputs.costPerLead.value)),
      confirmation: clamp(safeNumber(inputs.confirmation.value), 0, 100),
      delivery: clamp(safeNumber(inputs.delivery.value), 0, 100),
      price: Math.max(0, safeNumber(inputs.price.value)),
      productCost: Math.max(0, safeNumber(inputs.productCost.value)),
      parcelWeight: Math.max(0, safeNumber(inputs.parcelWeight.value, 1)),
    };
  }

  function getTariff(values) {
    const marketData = (values.platform === "codpartner" ? PARTNER_MARKETS : NETWORK_MARKETS)[values.country];
    let callCenter = marketData.callCenter?.[values.productType] || PRODUCT_FEES[values.productType];
    let returned = marketData.returned;
    let delivered = marketData.delivered;
    let fulfillment = marketData.fulfillment || 0;
    let planName = "With call center";
    let extraWeight = 0;

    if (values.platform === "codnetwork" && values.serviceMode === "without-center") {
      callCenter = { lead: 0, confirmed: 0, delivered: 0 };
      returned = marketData.noCallCenter;
      delivered = marketData.noCallCenter;
      fulfillment = 0;
      planName = "Without call center";
    }

    if (values.platform === "codpartner") {
      extraWeight = Math.max(0, values.parcelWeight - 5);
      planName = values.serviceMode === "free-return" ? "Free Return Plan" : "Free Plan";
      if (values.serviceMode === "free-return") {
        returned = 0;
        delivered = 7.99;
        fulfillment = 1;
      }
      returned += extraWeight;
      delivered += extraWeight;
    }

    return {
      ...marketData,
      callCenter,
      returned,
      delivered,
      fulfillment,
      planName,
      extraWeight,
      codLabel: marketData.codLabel || `${round2(marketData.codRate * 100)}%`,
    };
  }

  function calculate(values, tariff, confirmationPercent = values.confirmation, deliveryPercent = values.delivery) {
    const confirmed = values.leads * (confirmationPercent / 100);
    const delivered = confirmed * (deliveryPercent / 100);
    const sales = delivered * values.price;
    const leadFee = values.leads * tariff.callCenter.lead;
    const confirmedFee = confirmed * tariff.callCenter.confirmed;
    const deliveredHandlingFee = delivered * tariff.callCenter.delivered;
    const shippingBaseFee = confirmed * tariff.returned;
    const shippingUpliftFee = delivered * (tariff.delivered - tariff.returned);
    const fulfillmentFee = delivered * tariff.fulfillment;
    const codFee = sales * tariff.codRate;
    const serviceFees = leadFee + confirmedFee + deliveredHandlingFee + shippingBaseFee + shippingUpliftFee + fulfillmentFee + codFee;
    const totalProduct = delivered * values.productCost;
    const totalMarketing = values.leads * values.costPerLead;
    const totalCharges = serviceFees + totalProduct + totalMarketing;
    const netProfit = sales - totalCharges;
    return {
      confirmed,
      delivered,
      returned: Math.max(0, confirmed - delivered),
      sales,
      leadFee,
      confirmedFee,
      deliveredHandlingFee,
      shippingBaseFee,
      shippingUpliftFee,
      fulfillmentFee,
      codFee,
      serviceFees,
      codInvoice: sales - serviceFees,
      totalProduct,
      totalMarketing,
      totalCharges,
      netProfit,
      marginPercent: sales ? (netProfit / sales) * 100 : 0,
      profitPerDelivered: delivered ? netProfit / delivered : null,
      maxCpl: values.leads ? (netProfit + totalMarketing) / values.leads : 0,
    };
  }

  function formatProfit(value, currency) {
    if (value === null || !Number.isFinite(value)) return "—";
    return value < 0 ? `−${money(Math.abs(value), currency)}` : money(value, currency);
  }

  function renderMatrix(values, tariff) {
    const head = `<thead><tr><th scope="col">Conf<br>Del</th>${confirmationScenarios.map((rate) => `<th scope="col" class="${rate === values.confirmation ? "selected-axis" : ""}">${rate}%</th>`).join("")}</tr></thead>`;
    const body = deliveryScenarios.map((deliveryRate) => {
      const cells = confirmationScenarios.map((confirmationRate) => {
        const profit = calculate(values, tariff, confirmationRate, deliveryRate).profitPerDelivered ?? 0;
        const level = profit < 0 ? "loss" : profit < 5 ? "gain-low" : profit < 15 ? "gain" : "gain-high";
        const selected = confirmationRate === values.confirmation && deliveryRate === values.delivery;
        const selectionLabel = `Use ${confirmationRate}% confirmation and ${deliveryRate}% delivery`;
        return `<td class="${level} matrix-choice${selected ? " selected-cell" : ""}" data-confirmation="${confirmationRate}" data-delivery="${deliveryRate}" role="button" tabindex="0" aria-label="${selectionLabel}"${selected ? ' id="selectedScenarioCell" aria-current="true"' : ""}>${round2(profit).toFixed(2)}</td>`;
      }).join("");
      return `<tr><th scope="row" class="${deliveryRate === values.delivery ? "selected-axis" : ""}">${deliveryRate}%</th>${cells}</tr>`;
    }).join("");
    matrixTable.innerHTML = `${head}<tbody>${body}</tbody>`;
  }

  function renderSource(values, tariff) {
    const meta = PLATFORM_META[values.platform];
    setText("sourceBadge", meta.name);
    let note = values.platform === "codpartner"
      ? `${tariff.planName}. PDF tariff; $1/kg is added above 5 kg. VAT was not listed, so it is not added.`
      : `Published ${tariff.planName.toLowerCase()} tariff from the supplied dashboard.`;
    if (tariff.notice) note = tariff.notice;
    setText("sourceNote", note);
    setText("footerSource", meta.source + (tariff.notice ? ` ${tariff.notice}` : ""));
  }

  function render() {
    const values = readInputs();
    const tariff = getTariff(values);
    const result = calculate(values, tariff);
    const symbol = currencySymbol(tariff.currency);

    $("parcelWeightTile").hidden = values.platform !== "codpartner";
    document.querySelectorAll(".currency-symbol").forEach((node) => { node.textContent = symbol; });
    confirmationRange.value = values.confirmation;
    deliveryRange.value = values.delivery;
    if (values.leads > Number(leadsRange.max)) {
      leadsRange.max = Math.ceil(values.leads / 1000) * 1000;
      setText("leadsRangeMax", displayCount.format(Number(leadsRange.max)));
    }
    leadsRange.value = Math.min(values.leads, Number(leadsRange.max));

    setText("tariffLead", tariff.callCenter.lead ? money(tariff.callCenter.lead, tariff.currency) : "Free");
    setText("tariffConfirmed", tariff.callCenter.confirmed ? money(tariff.callCenter.confirmed, tariff.currency) : "Free");
    setText("tariffDelivered", tariff.callCenter.delivered ? money(tariff.callCenter.delivered, tariff.currency) : "Free");
    setText("tariffShipDelivered", money(tariff.delivered, tariff.currency));
    setText("tariffShipReturned", money(tariff.returned, tariff.currency));
    setText("tariffCod", tariff.codLabel);
    setText("tariffVat", tariff.vat);
    setText("invoiceKicker", `${PLATFORM_META[values.platform].name} · ${tariff.flag} ${tariff.name} · ${tariff.planName}`);
    setText("currencyPill", tariff.currency);
    renderSource(values, tariff);

    setText("marginPercent", `${round2(result.marginPercent).toFixed(2)}%`);
    setText("profitPerDelivered", formatProfit(result.profitPerDelivered, tariff.currency));
    setText("maxCpl", formatProfit(result.maxCpl, tariff.currency));
    setText("leadsSummary", displayCount.format(values.leads));
    setText("confirmedSummary", displayCount.format(result.confirmed));
    setText("deliveredSummary", displayCount.format(result.delivered));

    setText("leadRate", tariff.callCenter.lead ? money(tariff.callCenter.lead, tariff.currency) : "Free");
    setText("confirmedRate", tariff.callCenter.confirmed ? money(tariff.callCenter.confirmed, tariff.currency) : "Free");
    setText("deliveredRate", tariff.callCenter.delivered ? money(tariff.callCenter.delivered, tariff.currency) : "Free");
    setText("returnedShipRate", money(tariff.returned, tariff.currency));
    setText("deliveredShipUpliftRate", money(tariff.delivered - tariff.returned, tariff.currency));
    setText("fulfillmentRate", tariff.fulfillment ? money(tariff.fulfillment, tariff.currency) : "Free");
    setText("codRate", tariff.codLabel);

    setText("leadQty", count.format(values.leads));
    setText("confirmedQty", count.format(result.confirmed));
    setText("deliveredQty", count.format(result.delivered));
    setText("shippingQty", count.format(result.confirmed));
    setText("deliveredShipQty", count.format(result.delivered));
    setText("fulfillmentQty", count.format(result.delivered));
    setText("salesBase", money(result.sales, tariff.currency));

    setText("leadFee", money(result.leadFee, tariff.currency));
    setText("confirmedFee", money(result.confirmedFee, tariff.currency));
    setText("deliveredHandlingFee", money(result.deliveredHandlingFee, tariff.currency));
    setText("shippingBaseFee", money(result.shippingBaseFee, tariff.currency));
    setText("shippingUpliftFee", money(result.shippingUpliftFee, tariff.currency));
    setText("fulfillmentFee", money(result.fulfillmentFee, tariff.currency));
    setText("codFee", money(result.codFee, tariff.currency));
    setText("serviceFees", money(result.serviceFees, tariff.currency));
    setText("sales", money(result.sales, tariff.currency));
    setText("codInvoice", money(result.codInvoice, tariff.currency));
    setText("productMath", `${money(values.productCost, tariff.currency)} × ${count.format(result.delivered)}`);
    setText("marketingMath", `${money(values.costPerLead, tariff.currency)} × ${count.format(values.leads)}`);
    setText("totalProduct", money(result.totalProduct, tariff.currency));
    setText("totalMarketing", money(result.totalMarketing, tariff.currency));
    setText("totalCharges", money(result.totalCharges, tariff.currency));
    setText("netProfit", formatProfit(result.netProfit, tariff.currency));
    setText("matrixCurrent", formatProfit(result.profitPerDelivered, tariff.currency));
    setText("matrixNote", `Click any number to load its rates. Current scenario: ${values.confirmation}% confirmation × ${values.delivery}% delivery.`);
    $("profitCard").classList.toggle("is-loss", result.netProfit < 0);

    renderMatrix(values, tariff);
    return { inputs: values, tariff, results: result };
  }

  function setValues(next) {
    if (next.platform && PLATFORM_META[next.platform]) {
      platformSelect.value = next.platform;
      updateCountryOptions(next.country);
      updateServiceModes(next.serviceMode);
    } else if (next.country) {
      updateCountryOptions(next.country);
      updateServiceModes(next.serviceMode || serviceModeSelect.value);
    }
    if (next.productType && PRODUCT_FEES[next.productType]) productTypeSelect.value = next.productType;
    if (next.serviceMode && [...serviceModeSelect.options].some((option) => option.value === next.serviceMode)) serviceModeSelect.value = next.serviceMode;
    for (const [key, input] of Object.entries(inputs)) {
      if (!(key in next)) continue;
      const value = safeNumber(next[key], DEFAULTS[key]);
      input.value = (key === "confirmation" || key === "delivery") ? clamp(value, 0, 100) : Math.max(0, value);
    }
    return render();
  }

  platformSelect.addEventListener("change", () => {
    updateCountryOptions(platformSelect.value === "codpartner" ? "ksa" : "ksa");
    updateServiceModes(platformSelect.value === "codpartner" ? "free" : "with-center");
    render();
  });
  countrySelect.addEventListener("change", () => { updateServiceModes(serviceModeSelect.value); render(); });
  productTypeSelect.addEventListener("change", render);
  serviceModeSelect.addEventListener("change", render);
  inputs.costPerLead.addEventListener("input", render);
  inputs.price.addEventListener("input", render);
  inputs.productCost.addEventListener("input", render);
  inputs.parcelWeight.addEventListener("input", render);
  inputs.leads.addEventListener("input", render);
  leadsRange.addEventListener("input", () => { inputs.leads.value = leadsRange.value; render(); });
  inputs.confirmation.addEventListener("input", render);
  inputs.delivery.addEventListener("input", render);
  confirmationRange.addEventListener("input", () => { inputs.confirmation.value = confirmationRange.value; render(); });
  deliveryRange.addEventListener("input", () => { inputs.delivery.value = deliveryRange.value; render(); });
  $("resetButton").addEventListener("click", () => {
    leadsRange.max = 5000;
    setText("leadsRangeMax", "5,000");
    platformSelect.value = DEFAULTS.platform;
    updateCountryOptions(DEFAULTS.country);
    updateServiceModes(DEFAULTS.serviceMode);
    productTypeSelect.value = DEFAULTS.productType;
    setValues(DEFAULTS);
  });
  $("focusCellButton").addEventListener("click", () => {
    const selected = $("selectedScenarioCell");
    if (selected) selected.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
  function loadMatrixScenario(cell) {
    const confirmation = safeNumber(cell.dataset.confirmation, DEFAULTS.confirmation);
    const delivery = safeNumber(cell.dataset.delivery, DEFAULTS.delivery);
    setValues({ confirmation, delivery });
  }
  matrixTable.addEventListener("click", (event) => {
    const cell = event.target.closest("td.matrix-choice");
    if (cell) loadMatrixScenario(cell);
  });
  matrixTable.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const cell = event.target.closest("td.matrix-choice");
    if (!cell) return;
    event.preventDefault();
    loadMatrixScenario(cell);
  });

  function registerWebMcpTools() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const allowedKeys = new Set([...Object.keys(DEFAULTS)]);

    Promise.resolve(context.registerTool({
      name: "set_cod_simulator_inputs",
      title: "Set COD simulator inputs",
      description: "Update the visible platform, market, plan, product or campaign inputs and recalculate all results.",
      inputSchema: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["codnetwork", "codpartner"] },
          country: { type: "string" },
          productType: { type: "string", enum: ["gadget", "cosmetic"] },
          serviceMode: { type: "string" },
          leads: { type: "number", minimum: 0 },
          costPerLead: { type: "number", minimum: 0 },
          confirmation: { type: "number", minimum: 0, maximum: 100 },
          delivery: { type: "number", minimum: 0, maximum: 100 },
          price: { type: "number", minimum: 0 },
          productCost: { type: "number", minimum: 0 },
          parcelWeight: { type: "number", minimum: 0 },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(payload) {
        if (!payload || typeof payload !== "object" || Array.isArray(payload) || !Object.keys(payload).length) throw new Error("Provide at least one simulator input.");
        for (const [key, value] of Object.entries(payload)) {
          if (!allowedKeys.has(key)) throw new Error(`Unknown input: ${key}`);
          if (["leads", "costPerLead", "confirmation", "delivery", "price", "productCost", "parcelWeight"].includes(key)) {
            if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new Error(`${key} must be a non-negative number.`);
            if ((key === "confirmation" || key === "delivery") && value > 100) throw new Error(`${key} must be between 0 and 100.`);
          }
        }
        const state = setValues(payload);
        return summarize(state);
      },
    }, { signal: lifecycle.signal })).catch(() => {});

    Promise.resolve(context.registerTool({
      name: "read_cod_simulator_results",
      title: "Read COD simulator results",
      description: "Read the selected tariff, current campaign inputs and calculated profit results.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() { return summarize(render()); },
    }, { signal: lifecycle.signal })).catch(() => {});
  }

  function summarize(state) {
    return {
      inputs: state.inputs,
      tariff: {
        platform: PLATFORM_META[state.inputs.platform].name,
        market: state.tariff.name,
        currency: state.tariff.currency,
        plan: state.tariff.planName,
        leadFee: state.tariff.callCenter.lead,
        confirmationFee: state.tariff.callCenter.confirmed,
        deliveredServiceFee: state.tariff.callCenter.delivered,
        returnedShipping: state.tariff.returned,
        deliveredShipping: state.tariff.delivered,
        fulfillment: state.tariff.fulfillment,
        codRatePercent: state.tariff.codRate * 100,
      },
      results: {
        confirmedOrders: round2(state.results.confirmed),
        deliveredOrders: round2(state.results.delivered),
        sales: round2(state.results.sales),
        platformCharges: round2(state.results.serviceFees),
        totalCharges: round2(state.results.totalCharges),
        netProfit: round2(state.results.netProfit),
        profitPerDelivered: state.results.profitPerDelivered === null ? null : round2(state.results.profitPerDelivered),
        marginPercent: round2(state.results.marginPercent),
        breakEvenCostPerLead: round2(state.results.maxCpl),
      },
    };
  }

  platformSelect.value = DEFAULTS.platform;
  productTypeSelect.value = DEFAULTS.productType;
  updateCountryOptions(DEFAULTS.country);
  updateServiceModes(DEFAULTS.serviceMode);
  render();
  window.addEventListener("pageshow", () => {
    if (!PLATFORM_META[platformSelect.value]) platformSelect.value = DEFAULTS.platform;
    if (!PRODUCT_FEES[productTypeSelect.value]) productTypeSelect.value = DEFAULTS.productType;
    const preservedCountry = currentMarkets()[countrySelect.value] ? countrySelect.value : DEFAULTS.country;
    const preservedMode = serviceModeSelect.value || (platformSelect.value === "codpartner" ? "free" : "with-center");
    updateCountryOptions(preservedCountry);
    updateServiceModes(preservedMode);
    render();
  });
  registerWebMcpTools();
})();
