import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const TEAL  = '#42c2c1';
const BLUE  = '#3296d2';
const NAVY  = '#191b4e';
const WHITE = '#ffffff';
const LIGHT = '#f8f9fc';
const BORDER = '#e2e8f0';

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    backgroundColor: WHITE,
    color: '#1a1a2e',
  },

  // ── Header ──
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 140,
    height: 50,
    objectFit: 'contain',
  },
  quoteHeaderRight: {
    alignItems: 'flex-end',
  },
  quoteLabel: {
    fontSize: 9,
    color: TEAL,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quoteName: {
    fontSize: 20,
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
  },
  quoteDate: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 3,
  },

  // ── Blue accent bar ──
  accentBar: {
    backgroundColor: BLUE,
    height: 4,
    marginBottom: 28,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 40,
  },

  // ── Info row ──
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 28,
  },
  infoBox: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  infoLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 9.5,
    color: '#334155',
    lineHeight: 1.6,
  },
  infoTextBold: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    lineHeight: 1.6,
  },

  // ── Products table ──
  tableSection: {
    marginBottom: 20,
  },
  tableSectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: LIGHT,
  },
  colProduct: { flex: 3 },
  colQty:     { flex: 1, textAlign: 'center' },
  colPrice:   { flex: 1.5, textAlign: 'right' },
  colTotal:   { flex: 1.5, textAlign: 'right' },
  productTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  cellText: {
    fontSize: 9.5,
    color: '#475569',
  },
  cellTextBold: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },

  // ── Totals ──
  totalsSection: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  totalsBox: {
    width: 230,
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9.5,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 9.5,
    color: '#334155',
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginVertical: 8,
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NAVY,
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  totalFinalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  totalFinalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: TEAL,
  },

  // ── Notes ──
  notesBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
  },

  // ── Status banner ──
  statusBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 8.5,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 1.5,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NAVY,
    paddingHorizontal: 40,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  footerBrand: {
    fontSize: 8,
    color: TEAL,
    fontFamily: 'Helvetica-Bold',
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuoteLineItem {
  title: string;
  price: string;
  quantity: number;
}

interface QuoteData {
  id: number;
  name: string;
  quoteNumber: string;
  createdAt: string;
  currency: string;
  subtotal_price: string;
  total_tax?: string;
  total_price: string;
  shipping_line?: { title: string; price: string };
  line_items: QuoteLineItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  customer?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  customerNotes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatMoney(amount: string | number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── PDF Document ─────────────────────────────────────────────────────────────
function QuotePDF({ quote, logoPath }: { quote: QuoteData; logoPath: string }) {
  const shippingAddress = quote.shipping_address;
  const hasTax = parseFloat(quote.total_tax ?? '0') > 0;
  const hasShipping =
    quote.shipping_line && parseFloat(quote.shipping_line.price ?? '0') > 0;

  return (
    <Document title={`Quote ${quote.quoteNumber}`} author="NexGen Pharmaceuticals">
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Image src={logoPath} style={styles.logo} />
          <View style={styles.quoteHeaderRight}>
            <Text style={styles.quoteLabel}>Quote Request</Text>
            <Text style={styles.quoteName}>{quote.quoteNumber}</Text>
            <Text style={styles.quoteDate}>{formatDate(quote.createdAt)}</Text>
          </View>
        </View>

        {/* ── Accent bar ── */}
        <View style={styles.accentBar} />

        <View style={styles.body}>

          {/* ── Customer + Shipping ── */}
          <View style={styles.infoRow}>
            {quote.customer && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Prepared For</Text>
                <Text style={styles.infoTextBold}>
                  {quote.customer.first_name} {quote.customer.last_name}
                </Text>
                <Text style={styles.infoText}>{quote.customer.email}</Text>
              </View>
            )}
            {shippingAddress && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Ship To</Text>
                <Text style={styles.infoTextBold}>
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </Text>
                <Text style={styles.infoText}>{shippingAddress.address1}</Text>
                <Text style={styles.infoText}>
                  {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zip}
                </Text>
                <Text style={styles.infoText}>{shippingAddress.country}</Text>
              </View>
            )}
          </View>

          {/* ── Products Table ── */}
          <View style={styles.tableSection}>
            <Text style={styles.tableSectionTitle}>
              Products ({quote.line_items.length})
            </Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.colProduct]}>Product</Text>
              <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
              <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
            </View>

            {quote.line_items.map((item, index) => {
              const unitPrice = parseFloat(item.price);
              const rowTotal = unitPrice * item.quantity;
              return (
                <View
                  key={index}
                  style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <View style={styles.colProduct}>
                    <Text style={styles.productTitle}>{item.title}</Text>
                  </View>
                  <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
                  <Text style={[styles.cellText, styles.colPrice]}>
                    {formatMoney(item.price, quote.currency)}
                  </Text>
                  <Text style={[styles.cellTextBold, styles.colTotal]}>
                    {formatMoney(rowTotal, quote.currency)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* ── Totals ── */}
          <View style={styles.totalsSection}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatMoney(quote.subtotal_price, quote.currency)}
                </Text>
              </View>

              {hasShipping && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Shipping — {quote.shipping_line!.title}
                  </Text>
                  <Text style={styles.totalValue}>
                    {formatMoney(quote.shipping_line!.price, quote.currency)}
                  </Text>
                </View>
              )}

              {hasTax && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax</Text>
                  <Text style={styles.totalValue}>
                    {formatMoney(quote.total_tax!, quote.currency)}
                  </Text>
                </View>
              )}

              <View style={styles.totalDivider} />

              <View style={styles.totalFinalRow}>
                <Text style={styles.totalFinalLabel}>Total</Text>
                <Text style={styles.totalFinalValue}>
                  {formatMoney(quote.total_price, quote.currency)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Customer Notes ── */}
          {quote.customerNotes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Customer Notes</Text>
              <Text style={styles.notesText}>{quote.customerNotes}</Text>
            </View>
          )}

          {/* ── Status ── */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>
              This quote is currently under review. Our team will reach out to you shortly.{'\n'}
              Questions? Contact us at support@nxgenpharma.com
            </Text>
          </View>

        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerBrand}>NexGen Pharmaceuticals</Text>
          <Text style={styles.footerText}>{quote.quoteNumber}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

      </Page>
    </Document>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export async function generateQuotePDF(quote: QuoteData): Promise<Buffer> {
  // Read logo as base64 for embedding in PDF
  const logoPath = 'https://nxgenpharma-hydrogen-store.vercel.app/nxgenpharma-logo.png'

  const doc = React.createElement(QuotePDF, { quote, logoPath }) as React.ReactElement<any>;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}