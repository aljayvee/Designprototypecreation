const { readFileSync, writeFileSync } = require('fs');
const path = './src/app/components/CustomerPortal.tsx';
const lines = readFileSync(path, 'utf8').split('\n');

// Lines 624-656 is the input section (0-indexed 623-655)
// We'll replace it with a 2-row layout
const newInputSection = [
  '              {/* Input area: 2-row layout */}\r',
  '              <div style={{ borderTop: "1px solid #E5E7EB", padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>\r',
  '                {/* Row 1: shortcut buttons */}\r',
  '                <div style={{ display: "flex", gap: 6 }}>\r',
  '                  <button\r',
  '                    onClick={() => setShowMerchantReqModal(true)}\r',
  '                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFF0F5", border: `1px solid ${PINK}44`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: PINK }}\r',
  '                    title="Pabili Request"\r',
  '                  >\r',
  '                    <Gift size={14} /> Pabili Request\r',
  '                  </button>\r',
  '                  <button\r',
  '                    onClick={() => setShowPaymentModal(true)}\r',
  '                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FDF4", border: "1px solid #6EE7B744", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}\r',
  '                    title="Payment Mode"\r',
  '                  >\r',
  '                    <CreditCard size={14} /> Payment Mode\r',
  '                  </button>\r',
  '                </div>\r',
  '                {/* Row 2: text input + Send */}\r',
  '                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>\r',
  '                  <input\r',
  '                    ref={cdInputRef}\r',
  '                    placeholder="Type your message..."\r',
  '                    style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #D1D5DB", fontSize: "0.82rem", outline: "none" }}\r',
  '                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {\r',
  '                      if (e.key === "Enter" && cdInputRef.current?.value.trim()) {\r',
  '                        sendCD(cdInputRef.current.value.trim());\r',
  '                        cdInputRef.current.value = "";\r',
  '                      }\r',
  '                    }}\r',
  '                  />\r',
  '                  <button\r',
  '                    onClick={() => { if (cdInputRef.current?.value.trim()) { sendCD(cdInputRef.current.value.trim()); cdInputRef.current.value = ""; } }}\r',
  '                    style={{ background: PINK, color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}\r',
  '                  >Send</button>\r',
  '                </div>\r',
  '              </div>\r',
];

// Replace lines 623-655 (0-indexed) with new content
const cleaned = [...lines.slice(0, 623), ...newInputSection, ...lines.slice(656)];
writeFileSync(path, cleaned.join('\n'));
console.log('Done. New line count:', cleaned.length);
