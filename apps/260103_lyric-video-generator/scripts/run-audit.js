"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const audit_1 = require("../src/agents/audit");
const lyrics_json_1 = __importDefault(require("../src/remotion/lyrics.json"));
// Needed for type checking mainly, simplified import logic for script execution
// In a real scenario we'd import the schema types properly or infer them.
async function main() {
    console.log('Starting Audit Agent...');
    // Mock config props for layout check (simulating what's in Root.tsx)
    const mockConfig = {
        style: {
            fontSize: 80,
            fontFamily: 'Noto Sans JP',
            fontWeight: 700
        }
    };
    const auditAgent = new audit_1.AuditAgent();
    // @ts-ignore - casting for script simplicity vs strict schema import
    const report = auditAgent.check(lyrics_json_1.default, mockConfig);
    console.log('\n================ AUDIT REPORT ================');
    console.log(`Total Lines: ${report.summary.totalLines}`);
    console.log(`Errors:      ${report.summary.errorCount}`);
    console.log(`Warnings:    ${report.summary.warningCount}`);
    console.log('==============================================\n');
    if (report.issues.length === 0) {
        console.log('✅ All checks passed! The synchronization data looks healthy.');
    }
    else {
        report.issues.forEach(issue => {
            const icon = issue.type === 'error' ? '❌ [ERROR]' : '⚠️  [WARN]';
            console.log(`${icon} Line ${issue.lineIndex + 1}: ${issue.message}`);
            if (issue.details) {
                console.log(`   Details:`, JSON.stringify(issue.details));
            }
        });
    }
    if (!report.isValid) {
        console.log('\nFAILED: Critical errors detected. Please fix before rendering.');
        process.exit(1);
    }
    else {
        console.log('\nPASSED: No critical errors.');
    }
}
main().catch(console.error);
