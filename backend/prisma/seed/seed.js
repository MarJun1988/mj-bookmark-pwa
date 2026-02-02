"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_js_1 = require("../../dist/lib/prisma.js");
var SAMPLE_VERSION = [
    {
        versionNumber: 'v1.0.0',
        description: 'Erste stabile Version des Lesezeichen-Managers mit grundlegender Tab-, Gruppen- und Lesezeichenverwaltung.',
    },
    {
        versionNumber: 'v1.5.0',
        description: 'Kleinere Bugfixes und interne Verbesserungen für mehr Stabilität im Alltag.',
    },
    {
        versionNumber: 'v2.0.0',
        description: 'Großes Major-Release mit vollständig überarbeiteter Architektur, deutlich besserer Performance und modernisiertem UI/UX-Konzept.',
    },
    {
        versionNumber: 'v2.0.1',
        description: 'UI-Feinschliff im Login-Bereich, verbesserte Formularvalidierung sowie robuster Offline-Fallback bei fehlender Netzwerkverbindung.',
    },
    {
        versionNumber: 'v2.0.2',
        description: 'Fokus auf Stabilität: interne Refactorings, Bugfixes und weitere Glättung der Benutzerführung nach dem 2.0-Release.',
    },
    {
        versionNumber: 'v2.0.3',
        description: 'Verbesserte Account-Verwaltung, stabilere Skeleton- und Empty-States sowie diverse kleinere Bugfixes.',
    },
    {
        versionNumber: 'v2.0.4',
        description: 'Seeder refactored & Mobile FooterAppBar ohne Textanzeige.',
    },
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, SAMPLE_VERSION_1, v, version, stats;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Starting seed...');
                    _i = 0, SAMPLE_VERSION_1 = SAMPLE_VERSION;
                    _b.label = 1;
                case 1:
                    if (!(_i < SAMPLE_VERSION_1.length)) return [3 /*break*/, 4];
                    v = SAMPLE_VERSION_1[_i];
                    return [4 /*yield*/, prisma_js_1.prisma.version.create({
                            data: {
                                versionNumber: v.versionNumber,
                                description: v.description,
                            },
                        })];
                case 2:
                    version = _b.sent();
                    console.log("\uD83D\uDCD1 Created version: ".concat(version.versionNumber));
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    _a = {};
                    return [4 /*yield*/, prisma_js_1.prisma.version.count()];
                case 5:
                    stats = (_a.versions = _b.sent(),
                        _a);
                    console.log('\n📊 Seeding completed!');
                    console.log('-------------------');
                    console.log("Versions: ".concat(stats.versions));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_js_1.prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
