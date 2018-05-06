var CPU6502 =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/cpu.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/cpu.js":
/*!********************!*\
  !*** ./src/cpu.js ***!
  \********************/
/*! exports provided: CPU6502 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CPU6502", function() { return CPU6502; });
/* harmony import */ var _opcodes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./opcodes.js */ "./src/opcodes.js");


class CPU6502{
    constructor(){
        this.PC = 0; // Program counter

	    this.A = 0; this.X = 0; this.Y = 0; this.S = 0; // Registers
	    this.N = 0; this.Z = 1; this.C = 0; this.V = 0; // ALU flags
	    this.I = 0; this.D = 0; // Other flags

	    this.irq = 0; this.nmi = 0; // IRQ lines

	    this.tmp = 0; this.addr = 0; // Temporary registers
	    this.opcode = 0; // Current opcode
	    this.cycles = 0; // Cycles counter
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // CPU control
    ////////////////////////////////////////////////////////////////////////////////

    reset() {

	    this.A = 0; this.X = 0; this.Y = 0; this.S = 0;
	    this.N = 0; this.Z = 1; this.C = 0; this.V = 0;
	    this.I = 0; this.D = 0;

	    this.PC = (this.read(0xFFFD) << 8) | this.read(0xFFFC);
    }
    
    step() {
	    this.opcode = this.read( this.PC++ );
	    _opcodes_js__WEBPACK_IMPORTED_MODULE_0__["default"][ this.opcode ]( this );
    }
    
    log(){
	    var msg = "nPC=" + this.PC.toString(16);
	    msg += " cyc=" + this.cycles;
	    msg += " [" + this.opcode.toString(16) + "] ";
	    msg += ( this.C ? "C" : "-");
	    msg += ( this.N ? "N" : "-");
	    msg += ( this.Z ? "Z" : "-");
	    msg += ( this.V ? "V" : "-");
	    msg += ( this.D ? "D" : "-");
	    msg += ( this.I ? "I" : "-");
	    msg += " A=" + this.A.toString(16);
	    msg += " X=" + this.X.toString(16);
	    msg += " Y=" + this.Y.toString(16);
	    msg += " S=" + this.S.toString(16);
	    console.log(msg);
    }
    
    ////////////////////////////////////////////////////////////////////////////////
    // Subroutines - addressing modes & flags
    ////////////////////////////////////////////////////////////////////////////////

    izx() {
	    var a = (this.read(this.PC++) + this.X) & 0xFF;
	    this.addr = (this.read(a+1) << 8) | this.read(a);
	    this.cycles += 6;
    }

    izy() {
	    var a = this.read(this.PC++);
	    var paddr = (this.read((a+1) & 0xFF) << 8) | this.read(a);
	    this.addr = (paddr + this.Y);
	    if ( (paddr & 0x100) != (this.addr & 0x100) ) {
		    this.cycles += 6;
	    } else {
		    this.cycles += 5;
	    }
    }

    ind() {
	    var a = this.read(this.PC);
	    a |= this.read( (this.PC & 0xFF00) | ((this.PC + 1) & 0xFF) ) << 8;
	    this.addr = this.read(a);
	    this.addr |= (this.read(a+1) << 8);
	    this.cycles += 5;
    }

    zp() {
	    this.addr = this.read(this.PC++);
	    this.cycles += 3;
    }

    zpx() {
	    this.addr = (this.read(this.PC++) + this.X) & 0xFF;
	    this.cycles += 4;
    }

    zpy() {
	    this.addr = (this.read(this.PC++) + this.Y) & 0xFF;
	    this.cycles += 4;
    }

    imp() {
	    this.cycles += 2;
    }

    imm() {
	    this.addr = this.PC++;
	    this.cycles += 2;
    }

    abs() {
	    this.addr = this.read(this.PC++);
	    this.addr |= (this.read(this.PC++) << 8);
	    this.cycles += 4;
    }

    abx() {
	    var paddr = this.read(this.PC++);
	    paddr |= (this.read(this.PC++) << 8);
	    this.addr = (paddr + this.X);
	    if ( (paddr & 0x100) != (this.addr & 0x100) ) {
		    this.cycles += 5;
	    } else {
		    this.cycles += 4;
	    }
    }

    aby() {
	    var paddr = this.read(this.PC++);
	    paddr |= (this.read(this.PC++) << 8);
	    this.addr = (paddr + this.Y);
	    if ( (paddr & 0x100) != (this.addr & 0x100) ) {
		    this.cycles += 5;
	    } else {
		    this.cycles += 4;
	    }
    }

    rel() {
	    this.addr = this.read(this.PC++);
	    if (this.addr & 0x80) {
		    this.addr -= 0x100;
	    }
	    this.addr += this.PC;
	    this.cycles += 2;
    }

    rmw() {
	    this.write(this.addr, this.tmp & 0xFF);
	    this.cycles += 2;
    }

    fnz(v) {
	    this.Z = ((v & 0xFF) == 0) ? 1 : 0;
	    this.N = ((v & 0x80) != 0) ? 1 : 0;
    }

    // Borrow
    fnzb(v) {
	    this.Z = ((v & 0xFF) == 0) ? 1 : 0;
	    this.N = ((v & 0x80) != 0) ? 1 : 0;
	    this.C = ((v & 0x100) != 0) ? 0 : 1;
    }

    // Carry
    fnzc(v) {
	    this.Z = ((v & 0xFF) == 0) ? 1 : 0;
	    this.N = ((v & 0x80) != 0) ? 1 : 0;
	    this.C = ((v & 0x100) != 0) ? 1 : 0;
    }

    branch(v) {
	    if (v) {
		    if ( (this.addr & 0x100) != (this.PC & 0x100) ) {
			    this.cycles += 2;
		    } else {
			    this.cycles += 1;
		    }
		    this.PC = this.addr;
	    }
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Subroutines - instructions
    ////////////////////////////////////////////////////////////////////////////////
    adc() {
	    var v = this.read(this.addr);
	    var c = this.C;
	    var r = this.A + v + c;
	    if (this.D) {
		    var al = (this.A & 0x0F) + (v & 0x0F) + c;
		    if (al > 9) al += 6;
		    var ah = (this.A >> 4) + (v >> 4) + ((al > 15) ? 1 : 0);
		    this.Z = ((r & 0xFF) == 0) ? 1 : 0;
		    this.N = ((ah & 8) != 0) ? 1 : 0;
		    this.V = ((~(this.A ^ v) & (this.A ^ (ah << 4)) & 0x80) != 0) ? 1 : 0;
		    if (ah > 9) ah += 6;
		    this.C = (ah > 15) ? 1 : 0;
		    this.A = ((ah << 4) | (al & 15)) & 0xFF;
	    } else {
		    this.Z = ((r & 0xFF) == 0) ? 1 : 0;
		    this.N = ((r & 0x80) != 0) ? 1 : 0;
		    this.V = ((~(this.A ^ v) & (this.A ^ r) & 0x80) != 0) ? 1 : 0;
		    this.C = ((r & 0x100) != 0) ? 1 : 0;
		    this.A = r & 0xFF;
	    }
    }

    ahx() {
	    this.tmp = ((this.addr >> 8) + 1) & this.A & this.X;
	    this.write(this.addr, this.tmp & 0xFF);
    }

    alr() {
	    this.tmp = this.read(this.addr) & this.A;
	    this.tmp = ((this.tmp & 1) << 8) | (this.tmp >> 1);
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    anc() {
	    this.tmp = this.read(this.addr);
	    this.tmp |= ((this.tmp & 0x80) & (this.A & 0x80)) << 1;
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    and() {
	    this.A &= this.read(this.addr);
	    this.fnz(this.A);
    }

    ane() {
	    this.tmp = this.read(this.addr) & this.A & (this.A | 0xEE);
	    this.fnz(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    arr() {
	    this.tmp = this.read(this.adfdr) & this.A;
	    this.C = ((this.tmp & 0x80) != 0);
	    this.V = ((((this.tmp >> 7) & 1) ^ ((this.tmp >> 6) & 1)) != 0);
	    if (this.D) {
		    var al = (this.tmp & 0x0F) + (this.tmp & 1);
		    if (al > 5) al += 6;
		    var ah = ((this.tmp >> 4) & 0x0F) + ((this.tmp >> 4) & 1);
		    if (ah > 5) {
			    al += 6;
			    this.C = true;
		    } else {
			    this.C = false;
		    }
		    this.tmp = (ah << 4) | al;
	    }
	    this.fnz(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    asl() {
	    this.tmp = this.read(this.addr) << 1;
	    this.fnzc(this.tmp);
	    this.tmp &= 0xFF;
    }
    asla() {
	    this.tmp = this.A << 1;
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    bit() {
	    this.tmp = this.read(this.addr);
	    this.N = ((this.tmp & 0x80) != 0) ? 1 : 0;
	    this.V = ((this.tmp & 0x40) != 0) ? 1 : 0;
	    this.Z = ((this.tmp & this.A) == 0) ? 1 : 0;
    }

    brk() {
	    this.PC++;
	    this.write(this.S + 0x100, this.PC >> 8);
	    this.S = (this.S - 1) & 0xFF;
	    this.write(this.S + 0x100, this.PC & 0xFF);
	    this.S = (this.S - 1) & 0xFF;
	    var v = this.N << 7;
	    v |= this.V << 6;
	    v |= 3 << 4;
	    v |= this.D << 3;
	    v |= this.I << 2;
	    v |= this.Z << 1;
	    v |= this.C;
	    this.write(this.S + 0x100, v);
	    this.S = (this.S - 1) & 0xFF;
	    this.I = 1;
	    this.D = 0;
	    this.PC = (this.read(0xFFFF) << 8) | this.read(0xFFFE);
	    this.cycles += 5;
    }

    bcc() { this.branch( this.C == 0 ); }
    bcs() { this.branch( this.C == 1 ); }
    beq() { this.branch( this.Z == 1 ); }
    bne() { this.branch( this.Z == 0 ); }
    bmi() { this.branch( this.N == 1 ); }
    bpl() { this.branch( this.N == 0 ); }
    bvc() { this.branch( this.V == 0 ); }
    bvs() { this.branch( this.V == 1 ); }


    clc() { this.C = 0; }
    cld() { this.D = 0; }
    cli() { this.I = 0; }
    clv() { this.V = 0; }

    cmp() {
	    this.fnzb( this.A - this.read(this.addr) );
    }

    cpx() {
	    this.fnzb( this.X - this.read(this.addr) );
    }

    cpy() {
	    this.fnzb( this.Y - this.read(this.addr) );
    }

    dcp() {
	    this.tmp = (this.read(this.addr) - 1) & 0xFF;
	    this.tmp = this.A - this.tmp;
	    this.fnz(this.tmp);
    }

    dec() {
	    this.tmp = (this.read(this.addr) - 1) & 0xFF;
	    this.fnz(this.tmp);
    }

    dex() {
	    this.X = (this.X - 1) & 0xFF;
	    this.fnz(this.X);
    }

    dey() {
	    this.Y = (this.Y - 1) & 0xFF;
	    this.fnz(this.Y);
    }

    eor() {
	    this.A ^= this.read(this.addr);
	    this.fnz(this.A);
    }

    inc() {
	    this.tmp = (this.read(this.addr) + 1) & 0xFF;
	    this.fnz(this.tmp);
    }

    inx() {
	    this.X = (this.X + 1) & 0xFF;
	    this.fnz(this.X);
    }

    iny() {
	    this.Y = (this.Y + 1) & 0xFF;
	    this.fnz(this.Y);
    }

    isc() {
	    var v = (this.read(this.addr) + 1) & 0xFF;
	    var c = 1 - (this.C ? 1 : 0);
	    var r = this.A - v - c;
	    if (this.D) {
		    var al = (this.A & 0x0F) - (v & 0x0F) - c;
		    if (al > 0x80) al -= 6;
		    var ah = (this.A >> 4) - (v >> 4) - ((al > 0x80) ? 1 : 0);
		    this.Z = ((r & 0xFF) == 0);
		    this.N = ((r & 0x80) != 0);
		    this.V = (((this.A ^ v) & (this.A ^ r) & 0x80) != 0);
		    this.C = ((this.r & 0x100) != 0) ? 0 : 1;
		    if (ah > 0x80) ah -= 6;
		    this.A = ((ah << 4) | (al & 15)) & 0xFF;
	    } else {
		    this.Z = ((r & 0xFF) == 0);
		    this.N = ((r & 0x80) != 0);
		    this.V = (((this.A ^ v) & (this.A ^ r) & 0x80) != 0);
		    this.C = ((r & 0x100) != 0) ? 0 : 1;
		    this.A = r & 0xFF;
	    }
    }

    jmp() {
	    this.PC = this.addr;
	    this.cycles--;
    }

    jsr() {
	    this.write(this.S + 0x100, (this.PC - 1) >> 8);
	    this.S = (this.S - 1) & 0xFF;
	    this.write(this.S + 0x100, (this.PC - 1) & 0xFF);
	    this.S = (this.S - 1) & 0xFF;
	    this.PC = this.addr;
	    this.cycles += 2;
    }

    las() {
	    this.S = this.X = this.A = this.read(this.addr) & this.S;
	    this.fnz(this.A);
    }

    lax() {
	    this.X = this.A = this.read(this.addr);
	    this.fnz(this.A);
    }

    lda() {
	    this.A = this.read(this.addr);
	    this.fnz(this.A);
    }

    ldx() {
	    this.X = this.read(this.addr);
	    this.fnz(this.X);
    }

    ldy() {
	    this.Y = this.read(this.addr);
	    this.fnz(this.Y);
    }

    ora() {
	    this.A |= this.read(this.addr);
	    this.fnz(this.A);
    }

    rol() {
	    this.tmp = (this.read(this.addr) << 1) | this.C;
	    this.fnzc(this.tmp);
	    this.tmp &= 0xFF;
    }
    rla() {
	    this.tmp = (this.A << 1) | this.C;
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    ror() {
	    this.tmp = this.read(this.addr);
	    this.tmp = ((this.tmp & 1) << 8) | (this.C << 7) | (this.tmp >> 1);
	    this.fnzc(this.tmp);
	    this.tmp &= 0xFF;
    }
    rra() {
	    this.tmp = ((this.A & 1) << 8) | (this.C << 7) | (this.A >> 1);
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }


    lsr() {
	    this.tmp = this.read(this.addr);
	    this.tmp = ((this.tmp & 1) << 8) | (this.tmp >> 1);
	    this.fnzc(this.tmp);
	    this.tmp &= 0xFF;
    }
    lsra() {
	    this.tmp = ((this.A & 1) << 8) | (this.A >> 1);
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }


    nop() { }

    pha() {
	    this.write(this.S + 0x100, this.A);
	    this.S = (this.S - 1) & 0xFF;
	    this.cycles++;
    }

    php() {
	    var v = this.N << 7;
	    v |= this.V << 6;
	    v |= 3 << 4;
	    v |= this.D << 3;
	    v |= this.I << 2;
	    v |= this.Z << 1;
	    v |= this.C;
	    this.write(this.S + 0x100, v);
	    this.S = (this.S - 1) & 0xFF;
	    this.cycles++;
    }

    pla() {
	    this.S = (this.S + 1) & 0xFF;
	    this.A = this.read(this.S + 0x100);
	    this.fnz(this.A);
	    this.cycles += 2;
    }

    plp() {
	    this.S = (this.S + 1) & 0xFF;
	    this.tmp = this.read(this.S + 0x100);
	    this.N = ((this.tmp & 0x80) != 0) ? 1 : 0;
	    this.V = ((this.tmp & 0x40) != 0) ? 1 : 0;
	    this.D = ((this.tmp & 0x08) != 0) ? 1 : 0;
	    this.I = ((this.tmp & 0x04) != 0) ? 1 : 0;
	    this.Z = ((this.tmp & 0x02) != 0) ? 1 : 0;
	    this.C = ((this.tmp & 0x01) != 0) ? 1 : 0;
	    this.cycles += 2;
    }

    rti() {
	    this.S = (this.S + 1) & 0xFF;
	    this.tmp = this.read(this.S + 0x100);
	    this.N = ((this.tmp & 0x80) != 0) ? 1 : 0;
	    this.V = ((this.tmp & 0x40) != 0) ? 1 : 0;
	    this.D = ((this.tmp & 0x08) != 0) ? 1 : 0;
	    this.I = ((this.tmp & 0x04) != 0) ? 1 : 0;
	    this.Z = ((this.tmp & 0x02) != 0) ? 1 : 0;
	    this.C = ((this.tmp & 0x01) != 0) ? 1 : 0;
	    this.S = (this.S + 1) & 0xFF;
	    this.PC = this.read(this.S + 0x100);
	    this.S = (this.S + 1) & 0xFF;
	    this.PC |= this.read(this.S + 0x100) << 8;
	    this.cycles += 4;
    }

    rts() {
	    this.S = (this.S + 1) & 0xFF;
	    this.PC = this.read(this.S + 0x100);
	    this.S = (this.S + 1) & 0xFF;
	    this.PC |= this.read(this.S + 0x100) << 8;
	    this.PC++;
	    this.cycles += 4;
    }

    sbc() {
	    var v = this.read(this.addr);
	    var c = 1 - this.C;
	    var r = this.A - v - c;
	    if (this.D) {
		    var al = (this.A & 0x0F) - (v & 0x0F) - c;
		    if (al < 0) al -= 6;
		    var ah = (this.A >> 4) - (v >> 4) - ((al < 0) ? 1 : 0);
		    this.Z = ((r & 0xFF) == 0) ? 1 : 0;
		    this.N = ((r & 0x80) != 0) ? 1 : 0;
		    this.V = (((this.A ^ v) & (this.A ^ r) & 0x80) != 0) ? 1 : 0;
		    this.C = ((r & 0x100) != 0) ? 0 : 1;
		    if (ah < 0) ah -= 6;
		    this.A = ((ah << 4) | (al & 15)) & 0xFF;
	    } else {
		    this.Z = ((r & 0xFF) == 0) ? 1 : 0;
		    this.N = ((r & 0x80) != 0) ? 1 : 0;
		    this.V = (((this.A ^ v) & (this.A ^ r) & 0x80) != 0) ? 1 : 0;
		    this.C = ((r & 0x100) != 0) ? 0 : 1;
		    this.A = r & 0xFF;
	    }
    }

    sbx() {
	    this.tmp = this.read(this.addr) - (this.A & this.X);
	    this.fnzb(this.tmp);
	    this.X = (this.tmp & 0xFF);
    }

    sec() { this.C = 1; }
    sed() { this.D = 1; }
    sei() { this.I = 1; }

    shs() {
	    this.tmp = ((this.addr >> 8) + 1) & this.A & this.X;
	    this.write(this.addr, this.tmp & 0xFF);
	    this.S = (this.tmp & 0xFF);
    }

    shx() {
	    this.tmp = ((this.addr >> 8) + 1) & this.X;
	    this.write(this.addr, this.tmp & 0xFF);
    }

    shy() {
	    this.tmp = ((this.addr >> 8) + 1) & this.Y;
	    this.write(this.addr, this.tmp & 0xFF);
    }

    slo() {
	    this.tmp = this.read(this.addr) << 1;
	    this.tmp |= this.A;
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    sre() {
	    var v = this.read(this.addr);
	    this.tmp = ((v & 1) << 8) | (v >> 1);
	    this.tmp ^= this.A;
	    this.fnzc(this.tmp);
	    this.A = this.tmp & 0xFF;
    }

    sta() {
	    this.write(this.addr, this.A);
    }

    stx() {
	    this.write(this.addr, this.X);
    }

    sty() {
	    this.write(this.addr, this.Y);
    }

    tax() {
	    this.X = this.A;
	    this.fnz(this.X);
    }

    tay() {
	    this.Y = this.A;
	    this.fnz(this.Y);
    }

    tsx() {
	    this.X = this.S;
	    this.fnz(this.X);
    }

    txa() {
	    this.A = this.X;
	    this.fnz(this.A);
    }

    txs() {
	    this.S = this.X;
    }

    tya() {
	    this.A = this.Y;
	    this.fnz(this.A);
    }
}


////////////////////////////////////////////////////////////////////////////////
// CPU instantiation
////////////////////////////////////////////////////////////////////////////////




/***/ }),

/***/ "./src/opcodes.js":
/*!************************!*\
  !*** ./src/opcodes.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
////////////////////////////////////////////////////////////////////////////////
// Opcode table
////////////////////////////////////////////////////////////////////////////////

var CPU6502op = new Array();

/*  BRK     */ CPU6502op[0x00] = function(m) { m.imp(); m.brk(); };
/*  ORA izx */ CPU6502op[0x01] = function(m) { m.izx(); m.ora(); };
/* *KIL     */ CPU6502op[0x02] = function(m) { m.imp(); m.kil(); };
/* *SLO izx */ CPU6502op[0x03] = function(m) { m.izx(); m.slo(); m.rmw(); };
/* *NOP zp  */ CPU6502op[0x04] = function(m) { m.zp(); m.nop(); };
/*  ORA zp  */ CPU6502op[0x05] = function(m) { m.zp(); m.ora(); };
/*  ASL zp  */ CPU6502op[0x06] = function(m) { m.zp(); m.asl(); m.rmw(); };
/* *SLO zp  */ CPU6502op[0x07] = function(m) { m.zp(); m.slo(); m.rmw(); };
/*  PHP     */ CPU6502op[0x08] = function(m) { m.imp(); m.php(); };
/*  ORA imm */ CPU6502op[0x09] = function(m) { m.imm(); m.ora(); };
/*  ASL     */ CPU6502op[0x0A] = function(m) { m.imp(); m.asla(); };
/* *ANC imm */ CPU6502op[0x0B] = function(m) { m.imm(); m.anc(); };
/* *NOP abs */ CPU6502op[0x0C] = function(m) { m.abs(); m.nop(); };
/*  ORA abs */ CPU6502op[0x0D] = function(m) { m.abs(); m.ora(); };
/*  ASL abs */ CPU6502op[0x0E] = function(m) { m.abs(); m.asl(); m.rmw(); };
/* *SLO abs */ CPU6502op[0x0F] = function(m) { m.abs(); m.slo(); m.rmw(); };

/*  BPL rel */ CPU6502op[0x10] = function(m) { m.rel(); m.bpl(); };
/*  ORA izy */ CPU6502op[0x11] = function(m) { m.izy(); m.ora(); };
/* *KIL     */ CPU6502op[0x12] = function(m) { m.imp(); m.kil(); };
/* *SLO izy */ CPU6502op[0x13] = function(m) { m.izy(); m.slo(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0x14] = function(m) { m.zpx(); m.nop(); };
/*  ORA zpx */ CPU6502op[0x15] = function(m) { m.zpx(); m.ora(); };
/*  ASL zpx */ CPU6502op[0x16] = function(m) { m.zpx(); m.asl(); m.rmw(); };
/* *SLO zpx */ CPU6502op[0x17] = function(m) { m.zpx(); m.slo(); m.rmw(); };
/*  CLC     */ CPU6502op[0x18] = function(m) { m.imp(); m.clc(); };
/*  ORA aby */ CPU6502op[0x19] = function(m) { m.aby(); m.ora(); };
/* *NOP     */ CPU6502op[0x1A] = function(m) { m.imp(); m.nop(); };
/* *SLO aby */ CPU6502op[0x1B] = function(m) { m.aby(); m.slo(); m.rmw(); };
/* *NOP abx */ CPU6502op[0x1C] = function(m) { m.abx(); m.nop(); };
/*  ORA abx */ CPU6502op[0x1D] = function(m) { m.abx(); m.ora(); };
/*  ASL abx */ CPU6502op[0x1E] = function(m) { m.abx(); m.asl(); m.rmw(); };
/* *SLO abx */ CPU6502op[0x1F] = function(m) { m.abx(); m.slo(); m.rmw(); };

/*  JSR abs */ CPU6502op[0x20] = function(m) { m.abs(); m.jsr(); };
/*  AND izx */ CPU6502op[0x21] = function(m) { m.izx(); m.and(); };
/* *KIL     */ CPU6502op[0x22] = function(m) { m.imp(); m.kil(); };
/* *RLA izx */ CPU6502op[0x23] = function(m) { m.izx(); m.rla(); m.rmw(); };
/*  BIT zp  */ CPU6502op[0x24] = function(m) { m.zp(); m.bit(); };
/*  AND zp  */ CPU6502op[0x25] = function(m) { m.zp(); m.and(); };
/*  ROL zp  */ CPU6502op[0x26] = function(m) { m.zp(); m.rol(); m.rmw(); };
/* *RLA zp  */ CPU6502op[0x27] = function(m) { m.zp(); m.rla(); m.rmw(); };
/*  PLP     */ CPU6502op[0x28] = function(m) { m.imp(); m.plp(); };
/*  AND imm */ CPU6502op[0x29] = function(m) { m.imm(); m.and(); };
/*  ROL     */ CPU6502op[0x2A] = function(m) { m.imp(); m.rla(); };
/* *ANC imm */ CPU6502op[0x2B] = function(m) { m.imm(); m.anc(); };
/*  BIT abs */ CPU6502op[0x2C] = function(m) { m.abs(); m.bit(); };
/*  AND abs */ CPU6502op[0x2D] = function(m) { m.abs(); m.and(); };
/*  ROL abs */ CPU6502op[0x2E] = function(m) { m.abs(); m.rol(); m.rmw(); };
/* *RLA abs */ CPU6502op[0x2F] = function(m) { m.abs(); m.rla(); m.rmw(); };

/*  BMI rel */ CPU6502op[0x30] = function(m) { m.rel(); m.bmi(); };
/*  AND izy */ CPU6502op[0x31] = function(m) { m.izy(); m.and(); };
/* *KIL     */ CPU6502op[0x32] = function(m) { m.imp(); m.kil(); };
/* *RLA izy */ CPU6502op[0x33] = function(m) { m.izy(); m.rla(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0x34] = function(m) { m.zpx(); m.nop(); };
/*  AND zpx */ CPU6502op[0x35] = function(m) { m.zpx(); m.and(); };
/*  ROL zpx */ CPU6502op[0x36] = function(m) { m.zpx(); m.rol(); m.rmw(); };
/* *RLA zpx */ CPU6502op[0x37] = function(m) { m.zpx(); m.rla(); m.rmw(); };
/*  SEC     */ CPU6502op[0x38] = function(m) { m.imp(); m.sec(); };
/*  AND aby */ CPU6502op[0x39] = function(m) { m.aby(); m.and(); };
/* *NOP     */ CPU6502op[0x3A] = function(m) { m.imp(); m.nop(); };
/* *RLA aby */ CPU6502op[0x3B] = function(m) { m.aby(); m.rla(); m.rmw(); };
/* *NOP abx */ CPU6502op[0x3C] = function(m) { m.abx(); m.nop(); };
/*  AND abx */ CPU6502op[0x3D] = function(m) { m.abx(); m.and(); };
/*  ROL abx */ CPU6502op[0x3E] = function(m) { m.abx(); m.rol(); m.rmw(); };
/* *RLA abx */ CPU6502op[0x3F] = function(m) { m.abx(); m.rla(); m.rmw(); };

/*  RTI     */ CPU6502op[0x40] = function(m) { m.imp(); m.rti(); };
/*  EOR izx */ CPU6502op[0x41] = function(m) { m.izx(); m.eor(); };
/* *KIL     */ CPU6502op[0x42] = function(m) { m.imp(); m.kil(); };
/* *SRE izx */ CPU6502op[0x43] = function(m) { m.izx(); m.sre(); m.rmw(); };
/* *NOP zp  */ CPU6502op[0x44] = function(m) { m.zp(); m.nop(); };
/*  EOR zp  */ CPU6502op[0x45] = function(m) { m.zp(); m.eor(); };
/*  LSR zp  */ CPU6502op[0x46] = function(m) { m.zp(); m.lsr(); m.rmw(); };
/* *SRE zp  */ CPU6502op[0x47] = function(m) { m.zp(); m.sre(); m.rmw(); };
/*  PHA     */ CPU6502op[0x48] = function(m) { m.imp(); m.pha(); };
/*  EOR imm */ CPU6502op[0x49] = function(m) { m.imm(); m.eor(); };
/*  LSR     */ CPU6502op[0x4A] = function(m) { m.imp(); m.lsra(); };
/* *ALR imm */ CPU6502op[0x4B] = function(m) { m.imm(); m.alr(); };
/*  JMP abs */ CPU6502op[0x4C] = function(m) { m.abs(); m.jmp(); };
/*  EOR abs */ CPU6502op[0x4D] = function(m) { m.abs(); m.eor(); };
/*  LSR abs */ CPU6502op[0x4E] = function(m) { m.abs(); m.lsr(); m.rmw(); };
/* *SRE abs */ CPU6502op[0x4F] = function(m) { m.abs(); m.sre(); m.rmw(); };

/*  BVC rel */ CPU6502op[0x50] = function(m) { m.rel(); m.bvc(); };
/*  EOR izy */ CPU6502op[0x51] = function(m) { m.izy(); m.eor(); };
/* *KIL     */ CPU6502op[0x52] = function(m) { m.imp(); m.kil(); };
/* *SRE izy */ CPU6502op[0x53] = function(m) { m.izy(); m.sre(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0x54] = function(m) { m.zpx(); m.nop(); };
/*  EOR zpx */ CPU6502op[0x55] = function(m) { m.zpx(); m.eor(); };
/*  LSR zpx */ CPU6502op[0x56] = function(m) { m.zpx(); m.lsr(); m.rmw(); };
/* *SRE zpx */ CPU6502op[0x57] = function(m) { m.zpx(); m.sre(); m.rmw(); };
/*  CLI     */ CPU6502op[0x58] = function(m) { m.imp(); m.cli(); };
/*  EOR aby */ CPU6502op[0x59] = function(m) { m.aby(); m.eor(); };
/* *NOP     */ CPU6502op[0x5A] = function(m) { m.imp(); m.nop(); };
/* *SRE aby */ CPU6502op[0x5B] = function(m) { m.aby(); m.sre(); m.rmw(); };
/* *NOP abx */ CPU6502op[0x5C] = function(m) { m.abx(); m.nop(); };
/*  EOR abx */ CPU6502op[0x5D] = function(m) { m.abx(); m.eor(); };
/*  LSR abx */ CPU6502op[0x5E] = function(m) { m.abx(); m.lsr(); m.rmw(); };
/* *SRE abx */ CPU6502op[0x5F] = function(m) { m.abx(); m.sre(); m.rmw(); };

/*  RTS     */ CPU6502op[0x60] = function(m) { m.imp(); m.rts(); };
/*  ADC izx */ CPU6502op[0x61] = function(m) { m.izx(); m.adc(); };
/* *KIL     */ CPU6502op[0x62] = function(m) { m.imp(); m.kil(); };
/* *RRA izx */ CPU6502op[0x63] = function(m) { m.izx(); m.rra(); m.rmw(); };
/* *NOP zp  */ CPU6502op[0x64] = function(m) { m.zp(); m.nop(); };
/*  ADC zp  */ CPU6502op[0x65] = function(m) { m.zp(); m.adc(); };
/*  ROR zp  */ CPU6502op[0x66] = function(m) { m.zp(); m.ror(); m.rmw(); };
/* *RRA zp  */ CPU6502op[0x67] = function(m) { m.zp(); m.rra(); m.rmw(); };
/*  PLA     */ CPU6502op[0x68] = function(m) { m.imp(); m.pla(); };
/*  ADC imm */ CPU6502op[0x69] = function(m) { m.imm(); m.adc(); };
/*  ROR     */ CPU6502op[0x6A] = function(m) { m.imp(); m.rra(); };
/* *ARR imm */ CPU6502op[0x6B] = function(m) { m.imm(); m.arr(); };
/*  JMP ind */ CPU6502op[0x6C] = function(m) { m.ind(); m.jmp(); };
/*  ADC abs */ CPU6502op[0x6D] = function(m) { m.abs(); m.adc(); };
/*  ROR abs */ CPU6502op[0x6E] = function(m) { m.abs(); m.ror(); m.rmw(); };
/* *RRA abs */ CPU6502op[0x6F] = function(m) { m.abs(); m.rra(); m.rmw(); };

/*  BVS rel */ CPU6502op[0x70] = function(m) { m.rel(); m.bvs(); };
/*  ADC izy */ CPU6502op[0x71] = function(m) { m.izy(); m.adc(); };
/* *KIL     */ CPU6502op[0x72] = function(m) { m.imp(); m.kil(); };
/* *RRA izy */ CPU6502op[0x73] = function(m) { m.izy(); m.rra(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0x74] = function(m) { m.zpx(); m.nop(); };
/*  ADC zpx */ CPU6502op[0x75] = function(m) { m.zpx(); m.adc(); };
/*  ROR zpx */ CPU6502op[0x76] = function(m) { m.zpx(); m.ror(); m.rmw(); };
/* *RRA zpx */ CPU6502op[0x77] = function(m) { m.zpx(); m.rra(); m.rmw(); };
/*  SEI     */ CPU6502op[0x78] = function(m) { m.imp(); m.sei(); };
/*  ADC aby */ CPU6502op[0x79] = function(m) { m.aby(); m.adc(); };
/* *NOP     */ CPU6502op[0x7A] = function(m) { m.imp(); m.nop(); };
/* *RRA aby */ CPU6502op[0x7B] = function(m) { m.aby(); m.rra(); m.rmw(); };
/* *NOP abx */ CPU6502op[0x7C] = function(m) { m.abx(); m.nop(); };
/*  ADC abx */ CPU6502op[0x7D] = function(m) { m.abx(); m.adc(); };
/*  ROR abx */ CPU6502op[0x7E] = function(m) { m.abx(); m.ror(); m.rmw(); };
/* *RRA abx */ CPU6502op[0x7F] = function(m) { m.abx(); m.rra(); m.rmw(); };

/* *NOP imm */ CPU6502op[0x80] = function(m) { m.imm(); m.nop(); };
/*  STA izx */ CPU6502op[0x81] = function(m) { m.izx(); m.sta(); };
/* *NOP imm */ CPU6502op[0x82] = function(m) { m.imm(); m.nop(); };
/* *SAX izx */ CPU6502op[0x83] = function(m) { m.izx(); m.sax(); };
/*  STY zp  */ CPU6502op[0x84] = function(m) { m.zp(); m.sty(); };
/*  STA zp  */ CPU6502op[0x85] = function(m) { m.zp(); m.sta(); };
/*  STX zp  */ CPU6502op[0x86] = function(m) { m.zp(); m.stx(); };
/* *SAX zp  */ CPU6502op[0x87] = function(m) { m.zp(); m.sax(); };
/*  DEY     */ CPU6502op[0x88] = function(m) { m.imp(); m.dey(); };
/* *NOP imm */ CPU6502op[0x89] = function(m) { m.imm(); m.nop(); };
/*  TXA     */ CPU6502op[0x8A] = function(m) { m.imp(); m.txa(); };
/* *XAA imm */ CPU6502op[0x8B] = function(m) { m.imm(); m.xaa(); };
/*  STY abs */ CPU6502op[0x8C] = function(m) { m.abs(); m.sty(); };
/*  STA abs */ CPU6502op[0x8D] = function(m) { m.abs(); m.sta(); };
/*  STX abs */ CPU6502op[0x8E] = function(m) { m.abs(); m.stx(); };
/* *SAX abs */ CPU6502op[0x8F] = function(m) { m.abs(); m.sax(); };

/*  BCC rel */ CPU6502op[0x90] = function(m) { m.rel(); m.bcc(); };
/*  STA izy */ CPU6502op[0x91] = function(m) { m.izy(); m.sta(); };
/* *KIL     */ CPU6502op[0x92] = function(m) { m.imp(); m.kil(); };
/* *AHX izy */ CPU6502op[0x93] = function(m) { m.izy(); m.ahx(); };
/*  STY zpx */ CPU6502op[0x94] = function(m) { m.zpx(); m.sty(); };
/*  STA zpx */ CPU6502op[0x95] = function(m) { m.zpx(); m.sta(); };
/*  STX zpy */ CPU6502op[0x96] = function(m) { m.zpy(); m.stx(); };
/* *SAX zpy */ CPU6502op[0x97] = function(m) { m.zpy(); m.sax(); };
/*  TYA     */ CPU6502op[0x98] = function(m) { m.imp(); m.tya(); };
/*  STA aby */ CPU6502op[0x99] = function(m) { m.aby(); m.sta(); };
/*  TXS     */ CPU6502op[0x9A] = function(m) { m.imp(); m.txs(); };
/* *TAS aby */ CPU6502op[0x9B] = function(m) { m.aby(); m.tas(); };
/* *SHY abx */ CPU6502op[0x9C] = function(m) { m.abx(); m.shy(); };
/*  STA abx */ CPU6502op[0x9D] = function(m) { m.abx(); m.sta(); };
/* *SHX aby */ CPU6502op[0x9E] = function(m) { m.aby(); m.shx(); };
/* *AHX aby */ CPU6502op[0x9F] = function(m) { m.aby(); m.ahx(); };

/*  LDY imm */ CPU6502op[0xA0] = function(m) { m.imm(); m.ldy(); };
/*  LDA izx */ CPU6502op[0xA1] = function(m) { m.izx(); m.lda(); };
/*  LDX imm */ CPU6502op[0xA2] = function(m) { m.imm(); m.ldx(); };
/* *LAX izx */ CPU6502op[0xA3] = function(m) { m.izx(); m.lax(); };
/*  LDY zp  */ CPU6502op[0xA4] = function(m) { m.zp(); m.ldy(); };
/*  LDA zp  */ CPU6502op[0xA5] = function(m) { m.zp(); m.lda(); };
/*  LDX zp  */ CPU6502op[0xA6] = function(m) { m.zp(); m.ldx(); };
/* *LAX zp  */ CPU6502op[0xA7] = function(m) { m.zp(); m.lax(); };
/*  TAY     */ CPU6502op[0xA8] = function(m) { m.imp(); m.tay(); };
/*  LDA imm */ CPU6502op[0xA9] = function(m) { m.imm(); m.lda(); };
/*  TAX     */ CPU6502op[0xAA] = function(m) { m.imp(); m.tax(); };
/* *LAX imm */ CPU6502op[0xAB] = function(m) { m.imm(); m.lax(); };
/*  LDY abs */ CPU6502op[0xAC] = function(m) { m.abs(); m.ldy(); };
/*  LDA abs */ CPU6502op[0xAD] = function(m) { m.abs(); m.lda(); };
/*  LDX abs */ CPU6502op[0xAE] = function(m) { m.abs(); m.ldx(); };
/* *LAX abs */ CPU6502op[0xAF] = function(m) { m.abs(); m.lax(); };

/*  BCS rel */ CPU6502op[0xB0] = function(m) { m.rel(); m.bcs(); };
/*  LDA izy */ CPU6502op[0xB1] = function(m) { m.izy(); m.lda(); };
/* *KIL     */ CPU6502op[0xB2] = function(m) { m.imp(); m.kil(); };
/* *LAX izy */ CPU6502op[0xB3] = function(m) { m.izy(); m.lax(); };
/*  LDY zpx */ CPU6502op[0xB4] = function(m) { m.zpx(); m.ldy(); };
/*  LDA zpx */ CPU6502op[0xB5] = function(m) { m.zpx(); m.lda(); };
/*  LDX zpy */ CPU6502op[0xB6] = function(m) { m.zpy(); m.ldx(); };
/* *LAX zpy */ CPU6502op[0xB7] = function(m) { m.zpy(); m.lax(); };
/*  CLV     */ CPU6502op[0xB8] = function(m) { m.imp(); m.clv(); };
/*  LDA aby */ CPU6502op[0xB9] = function(m) { m.aby(); m.lda(); };
/*  TSX     */ CPU6502op[0xBA] = function(m) { m.imp(); m.tsx(); };
/* *LAS aby */ CPU6502op[0xBB] = function(m) { m.aby(); m.las(); };
/*  LDY abx */ CPU6502op[0xBC] = function(m) { m.abx(); m.ldy(); };
/*  LDA abx */ CPU6502op[0xBD] = function(m) { m.abx(); m.lda(); };
/*  LDX aby */ CPU6502op[0xBE] = function(m) { m.aby(); m.ldx(); };
/* *LAX aby */ CPU6502op[0xBF] = function(m) { m.aby(); m.lax(); };

/*  CPY imm */ CPU6502op[0xC0] = function(m) { m.imm(); m.cpy(); };
/*  CMP izx */ CPU6502op[0xC1] = function(m) { m.izx(); m.cmp(); };
/* *NOP imm */ CPU6502op[0xC2] = function(m) { m.imm(); m.nop(); };
/* *DCP izx */ CPU6502op[0xC3] = function(m) { m.izx(); m.dcp(); m.rmw(); };
/*  CPY zp  */ CPU6502op[0xC4] = function(m) { m.zp(); m.cpy(); };
/*  CMP zp  */ CPU6502op[0xC5] = function(m) { m.zp(); m.cmp(); };
/*  DEC zp  */ CPU6502op[0xC6] = function(m) { m.zp(); m.dec(); m.rmw(); };
/* *DCP zp  */ CPU6502op[0xC7] = function(m) { m.zp(); m.dcp(); m.rmw(); };
/*  INY     */ CPU6502op[0xC8] = function(m) { m.imp(); m.iny(); };
/*  CMP imm */ CPU6502op[0xC9] = function(m) { m.imm(); m.cmp(); };
/*  DEX     */ CPU6502op[0xCA] = function(m) { m.imp(); m.dex(); };
/* *AXS imm */ CPU6502op[0xCB] = function(m) { m.imm(); m.axs(); };
/*  CPY abs */ CPU6502op[0xCC] = function(m) { m.abs(); m.cpy(); };
/*  CMP abs */ CPU6502op[0xCD] = function(m) { m.abs(); m.cmp(); };
/*  DEC abs */ CPU6502op[0xCE] = function(m) { m.abs(); m.dec(); m.rmw(); };
/* *DCP abs */ CPU6502op[0xCF] = function(m) { m.abs(); m.dcp(); m.rmw(); };

/*  BNE rel */ CPU6502op[0xD0] = function(m) { m.rel(); m.bne(); };
/*  CMP izy */ CPU6502op[0xD1] = function(m) { m.izy(); m.cmp(); };
/* *KIL     */ CPU6502op[0xD2] = function(m) { m.imp(); m.kil(); };
/* *DCP izy */ CPU6502op[0xD3] = function(m) { m.izy(); m.dcp(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0xD4] = function(m) { m.zpx(); m.nop(); };
/*  CMP zpx */ CPU6502op[0xD5] = function(m) { m.zpx(); m.cmp(); };
/*  DEC zpx */ CPU6502op[0xD6] = function(m) { m.zpx(); m.dec(); m.rmw(); };
/* *DCP zpx */ CPU6502op[0xD7] = function(m) { m.zpx(); m.dcp(); m.rmw(); };
/*  CLD     */ CPU6502op[0xD8] = function(m) { m.imp(); m.cld(); };
/*  CMP aby */ CPU6502op[0xD9] = function(m) { m.aby(); m.cmp(); };
/* *NOP     */ CPU6502op[0xDA] = function(m) { m.imp(); m.nop(); };
/* *DCP aby */ CPU6502op[0xDB] = function(m) { m.aby(); m.dcp(); m.rmw(); };
/* *NOP abx */ CPU6502op[0xDC] = function(m) { m.abx(); m.nop(); };
/*  CMP abx */ CPU6502op[0xDD] = function(m) { m.abx(); m.cmp(); };
/*  DEC abx */ CPU6502op[0xDE] = function(m) { m.abx(); m.dec(); m.rmw(); };
/* *DCP abx */ CPU6502op[0xDF] = function(m) { m.abx(); m.dcp(); m.rmw(); };

/*  CPX imm */ CPU6502op[0xE0] = function(m) { m.imm(); m.cpx(); };
/*  SBC izx */ CPU6502op[0xE1] = function(m) { m.izx(); m.sbc(); };
/* *NOP imm */ CPU6502op[0xE2] = function(m) { m.imm(); m.nop(); };
/* *ISC izx */ CPU6502op[0xE3] = function(m) { m.izx(); m.isc(); m.rmw(); };
/*  CPX zp  */ CPU6502op[0xE4] = function(m) { m.zp(); m.cpx(); };
/*  SBC zp  */ CPU6502op[0xE5] = function(m) { m.zp(); m.sbc(); };
/*  INC zp  */ CPU6502op[0xE6] = function(m) { m.zp(); m.inc(); m.rmw(); };
/* *ISC zp  */ CPU6502op[0xE7] = function(m) { m.zp(); m.isc(); m.rmw(); };
/*  INX     */ CPU6502op[0xE8] = function(m) { m.imp(); m.inx(); };
/*  SBC imm */ CPU6502op[0xE9] = function(m) { m.imm(); m.sbc(); };
/*  NOP     */ CPU6502op[0xEA] = function(m) { m.imp(); m.nop(); };
/* *SBC imm */ CPU6502op[0xEB] = function(m) { m.imm(); m.sbc(); };
/*  CPX abs */ CPU6502op[0xEC] = function(m) { m.abs(); m.cpx(); };
/*  SBC abs */ CPU6502op[0xED] = function(m) { m.abs(); m.sbc(); };
/*  INC abs */ CPU6502op[0xEE] = function(m) { m.abs(); m.inc(); m.rmw(); };
/* *ISC abs */ CPU6502op[0xEF] = function(m) { m.abs(); m.isc(); m.rmw(); };

/*  BEQ rel */ CPU6502op[0xF0] = function(m) { m.rel(); m.beq(); };
/*  SBC izy */ CPU6502op[0xF1] = function(m) { m.izy(); m.sbc(); };
/* *KIL     */ CPU6502op[0xF2] = function(m) { m.imp(); m.kil(); };
/* *ISC izy */ CPU6502op[0xF3] = function(m) { m.izy(); m.isc(); m.rmw(); };
/* *NOP zpx */ CPU6502op[0xF4] = function(m) { m.zpx(); m.nop(); };
/*  SBC zpx */ CPU6502op[0xF5] = function(m) { m.zpx(); m.sbc(); };
/*  INC zpx */ CPU6502op[0xF6] = function(m) { m.zpx(); m.inc(); m.rmw(); };
/* *ISC zpx */ CPU6502op[0xF7] = function(m) { m.zpx(); m.isc(); m.rmw(); };
/*  SED     */ CPU6502op[0xF8] = function(m) { m.imp(); m.sed(); };
/*  SBC aby */ CPU6502op[0xF9] = function(m) { m.aby(); m.sbc(); };
/* *NOP     */ CPU6502op[0xFA] = function(m) { m.imp(); m.nop(); };
/* *ISC aby */ CPU6502op[0xFB] = function(m) { m.aby(); m.isc(); m.rmw(); };
/* *NOP abx */ CPU6502op[0xFC] = function(m) { m.abx(); m.nop(); };
/*  SBC abx */ CPU6502op[0xFD] = function(m) { m.abx(); m.sbc(); };
/*  INC abx */ CPU6502op[0xFE] = function(m) { m.abx(); m.inc(); m.rmw(); };
/* *ISC abx */ CPU6502op[0xFF] = function(m) { m.abx(); m.isc(); m.rmw(); };

/* harmony default export */ __webpack_exports__["default"] = (CPU6502op);


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DUFU2NTAyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0NQVTY1MDIvLi9zcmMvY3B1LmpzIiwid2VicGFjazovL0NQVTY1MDIvLi9zcmMvb3Bjb2Rlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseURBQWlELGNBQWM7QUFDL0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuRUE7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQjs7QUFFcEIsZ0JBQWdCLFlBQVksWUFBWSxZQUFZO0FBQ3BELGdCQUFnQixZQUFZLFlBQVksWUFBWTtBQUNwRCxnQkFBZ0IsWUFBWTs7QUFFNUIsa0JBQWtCLGNBQWM7O0FBRWhDLGtCQUFrQixlQUFlO0FBQ2pDLHFCQUFxQjtBQUNyQixxQkFBcUI7QUFDckI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLGdCQUFnQixZQUFZLFlBQVk7QUFDeEMsZ0JBQWdCLFlBQVksWUFBWTtBQUN4QyxnQkFBZ0I7O0FBRWhCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0QjtBQUN2QyxXQUFXLDRCQUE0Qjs7O0FBR3ZDLFdBQVcsWUFBWTtBQUN2QixXQUFXLFlBQVk7QUFDdkIsV0FBVyxZQUFZO0FBQ3ZCLFdBQVcsWUFBWTs7QUFFdkI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0EsV0FBVzs7QUFFWDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVyxZQUFZO0FBQ3ZCLFdBQVcsWUFBWTtBQUN2QixXQUFXLFlBQVk7O0FBRXZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRVE7Ozs7Ozs7Ozs7Ozs7QUNob0JSO0FBQUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUyxTQUFTO0FBQ3hFLDhDQUE4QyxRQUFRLFNBQVMsU0FBUztBQUN4RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsVUFBVTtBQUNqRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTOztBQUV6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTOztBQUV6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVMsU0FBUztBQUN4RSw4Q0FBOEMsUUFBUSxTQUFTLFNBQVM7QUFDeEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUzs7QUFFekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUzs7QUFFekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTLFNBQVM7QUFDeEUsOENBQThDLFFBQVEsU0FBUyxTQUFTO0FBQ3hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxVQUFVO0FBQ2pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7O0FBRXpFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7O0FBRXpFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUyxTQUFTO0FBQ3hFLDhDQUE4QyxRQUFRLFNBQVMsU0FBUztBQUN4RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTOztBQUV6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTOztBQUV6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTOztBQUVoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTOztBQUVoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTOztBQUVoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTOztBQUVoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTO0FBQy9ELDhDQUE4QyxRQUFRLFNBQVMsU0FBUztBQUN4RSw4Q0FBOEMsUUFBUSxTQUFTLFNBQVM7QUFDeEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUzs7QUFFekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUzs7QUFFekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxRQUFRLFNBQVM7QUFDL0QsOENBQThDLFFBQVEsU0FBUztBQUMvRCw4Q0FBOEMsUUFBUSxTQUFTLFNBQVM7QUFDeEUsOENBQThDLFFBQVEsU0FBUyxTQUFTO0FBQ3hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7O0FBRXpFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUyxTQUFTO0FBQ3pFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVM7QUFDaEUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7QUFDekUsOENBQThDLFNBQVMsU0FBUztBQUNoRSw4Q0FBOEMsU0FBUyxTQUFTO0FBQ2hFLDhDQUE4QyxTQUFTLFNBQVMsU0FBUztBQUN6RSw4Q0FBOEMsU0FBUyxTQUFTLFNBQVM7O0FBRXpFIiwiZmlsZSI6IjY1MDIuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NwdS5qc1wiKTtcbiIsImltcG9ydCBDUFU2NTAyb3AgZnJvbSAnLi9vcGNvZGVzLmpzJ1xuXG5jbGFzcyBDUFU2NTAye1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuUEMgPSAwOyAvLyBQcm9ncmFtIGNvdW50ZXJcblxuXHQgICAgdGhpcy5BID0gMDsgdGhpcy5YID0gMDsgdGhpcy5ZID0gMDsgdGhpcy5TID0gMDsgLy8gUmVnaXN0ZXJzXG5cdCAgICB0aGlzLk4gPSAwOyB0aGlzLlogPSAxOyB0aGlzLkMgPSAwOyB0aGlzLlYgPSAwOyAvLyBBTFUgZmxhZ3Ncblx0ICAgIHRoaXMuSSA9IDA7IHRoaXMuRCA9IDA7IC8vIE90aGVyIGZsYWdzXG5cblx0ICAgIHRoaXMuaXJxID0gMDsgdGhpcy5ubWkgPSAwOyAvLyBJUlEgbGluZXNcblxuXHQgICAgdGhpcy50bXAgPSAwOyB0aGlzLmFkZHIgPSAwOyAvLyBUZW1wb3JhcnkgcmVnaXN0ZXJzXG5cdCAgICB0aGlzLm9wY29kZSA9IDA7IC8vIEN1cnJlbnQgb3Bjb2RlXG5cdCAgICB0aGlzLmN5Y2xlcyA9IDA7IC8vIEN5Y2xlcyBjb3VudGVyXG4gICAgfVxuICAgIFxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ1BVIGNvbnRyb2xcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgcmVzZXQoKSB7XG5cblx0ICAgIHRoaXMuQSA9IDA7IHRoaXMuWCA9IDA7IHRoaXMuWSA9IDA7IHRoaXMuUyA9IDA7XG5cdCAgICB0aGlzLk4gPSAwOyB0aGlzLlogPSAxOyB0aGlzLkMgPSAwOyB0aGlzLlYgPSAwO1xuXHQgICAgdGhpcy5JID0gMDsgdGhpcy5EID0gMDtcblxuXHQgICAgdGhpcy5QQyA9ICh0aGlzLnJlYWQoMHhGRkZEKSA8PCA4KSB8IHRoaXMucmVhZCgweEZGRkMpO1xuICAgIH1cbiAgICBcbiAgICBzdGVwKCkge1xuXHQgICAgdGhpcy5vcGNvZGUgPSB0aGlzLnJlYWQoIHRoaXMuUEMrKyApO1xuXHQgICAgQ1BVNjUwMm9wWyB0aGlzLm9wY29kZSBdKCB0aGlzICk7XG4gICAgfVxuICAgIFxuICAgIGxvZygpe1xuXHQgICAgdmFyIG1zZyA9IFwiblBDPVwiICsgdGhpcy5QQy50b1N0cmluZygxNik7XG5cdCAgICBtc2cgKz0gXCIgY3ljPVwiICsgdGhpcy5jeWNsZXM7XG5cdCAgICBtc2cgKz0gXCIgW1wiICsgdGhpcy5vcGNvZGUudG9TdHJpbmcoMTYpICsgXCJdIFwiO1xuXHQgICAgbXNnICs9ICggdGhpcy5DID8gXCJDXCIgOiBcIi1cIik7XG5cdCAgICBtc2cgKz0gKCB0aGlzLk4gPyBcIk5cIiA6IFwiLVwiKTtcblx0ICAgIG1zZyArPSAoIHRoaXMuWiA/IFwiWlwiIDogXCItXCIpO1xuXHQgICAgbXNnICs9ICggdGhpcy5WID8gXCJWXCIgOiBcIi1cIik7XG5cdCAgICBtc2cgKz0gKCB0aGlzLkQgPyBcIkRcIiA6IFwiLVwiKTtcblx0ICAgIG1zZyArPSAoIHRoaXMuSSA/IFwiSVwiIDogXCItXCIpO1xuXHQgICAgbXNnICs9IFwiIEE9XCIgKyB0aGlzLkEudG9TdHJpbmcoMTYpO1xuXHQgICAgbXNnICs9IFwiIFg9XCIgKyB0aGlzLlgudG9TdHJpbmcoMTYpO1xuXHQgICAgbXNnICs9IFwiIFk9XCIgKyB0aGlzLlkudG9TdHJpbmcoMTYpO1xuXHQgICAgbXNnICs9IFwiIFM9XCIgKyB0aGlzLlMudG9TdHJpbmcoMTYpO1xuXHQgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICB9XG4gICAgXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBTdWJyb3V0aW5lcyAtIGFkZHJlc3NpbmcgbW9kZXMgJiBmbGFnc1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBpengoKSB7XG5cdCAgICB2YXIgYSA9ICh0aGlzLnJlYWQodGhpcy5QQysrKSArIHRoaXMuWCkgJiAweEZGO1xuXHQgICAgdGhpcy5hZGRyID0gKHRoaXMucmVhZChhKzEpIDw8IDgpIHwgdGhpcy5yZWFkKGEpO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gNjtcbiAgICB9XG5cbiAgICBpenkoKSB7XG5cdCAgICB2YXIgYSA9IHRoaXMucmVhZCh0aGlzLlBDKyspO1xuXHQgICAgdmFyIHBhZGRyID0gKHRoaXMucmVhZCgoYSsxKSAmIDB4RkYpIDw8IDgpIHwgdGhpcy5yZWFkKGEpO1xuXHQgICAgdGhpcy5hZGRyID0gKHBhZGRyICsgdGhpcy5ZKTtcblx0ICAgIGlmICggKHBhZGRyICYgMHgxMDApICE9ICh0aGlzLmFkZHIgJiAweDEwMCkgKSB7XG5cdFx0ICAgIHRoaXMuY3ljbGVzICs9IDY7XG5cdCAgICB9IGVsc2Uge1xuXHRcdCAgICB0aGlzLmN5Y2xlcyArPSA1O1xuXHQgICAgfVxuICAgIH1cblxuICAgIGluZCgpIHtcblx0ICAgIHZhciBhID0gdGhpcy5yZWFkKHRoaXMuUEMpO1xuXHQgICAgYSB8PSB0aGlzLnJlYWQoICh0aGlzLlBDICYgMHhGRjAwKSB8ICgodGhpcy5QQyArIDEpICYgMHhGRikgKSA8PCA4O1xuXHQgICAgdGhpcy5hZGRyID0gdGhpcy5yZWFkKGEpO1xuXHQgICAgdGhpcy5hZGRyIHw9ICh0aGlzLnJlYWQoYSsxKSA8PCA4KTtcblx0ICAgIHRoaXMuY3ljbGVzICs9IDU7XG4gICAgfVxuXG4gICAgenAoKSB7XG5cdCAgICB0aGlzLmFkZHIgPSB0aGlzLnJlYWQodGhpcy5QQysrKTtcblx0ICAgIHRoaXMuY3ljbGVzICs9IDM7XG4gICAgfVxuXG4gICAgenB4KCkge1xuXHQgICAgdGhpcy5hZGRyID0gKHRoaXMucmVhZCh0aGlzLlBDKyspICsgdGhpcy5YKSAmIDB4RkY7XG5cdCAgICB0aGlzLmN5Y2xlcyArPSA0O1xuICAgIH1cblxuICAgIHpweSgpIHtcblx0ICAgIHRoaXMuYWRkciA9ICh0aGlzLnJlYWQodGhpcy5QQysrKSArIHRoaXMuWSkgJiAweEZGO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gNDtcbiAgICB9XG5cbiAgICBpbXAoKSB7XG5cdCAgICB0aGlzLmN5Y2xlcyArPSAyO1xuICAgIH1cblxuICAgIGltbSgpIHtcblx0ICAgIHRoaXMuYWRkciA9IHRoaXMuUEMrKztcblx0ICAgIHRoaXMuY3ljbGVzICs9IDI7XG4gICAgfVxuXG4gICAgYWJzKCkge1xuXHQgICAgdGhpcy5hZGRyID0gdGhpcy5yZWFkKHRoaXMuUEMrKyk7XG5cdCAgICB0aGlzLmFkZHIgfD0gKHRoaXMucmVhZCh0aGlzLlBDKyspIDw8IDgpO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gNDtcbiAgICB9XG5cbiAgICBhYngoKSB7XG5cdCAgICB2YXIgcGFkZHIgPSB0aGlzLnJlYWQodGhpcy5QQysrKTtcblx0ICAgIHBhZGRyIHw9ICh0aGlzLnJlYWQodGhpcy5QQysrKSA8PCA4KTtcblx0ICAgIHRoaXMuYWRkciA9IChwYWRkciArIHRoaXMuWCk7XG5cdCAgICBpZiAoIChwYWRkciAmIDB4MTAwKSAhPSAodGhpcy5hZGRyICYgMHgxMDApICkge1xuXHRcdCAgICB0aGlzLmN5Y2xlcyArPSA1O1xuXHQgICAgfSBlbHNlIHtcblx0XHQgICAgdGhpcy5jeWNsZXMgKz0gNDtcblx0ICAgIH1cbiAgICB9XG5cbiAgICBhYnkoKSB7XG5cdCAgICB2YXIgcGFkZHIgPSB0aGlzLnJlYWQodGhpcy5QQysrKTtcblx0ICAgIHBhZGRyIHw9ICh0aGlzLnJlYWQodGhpcy5QQysrKSA8PCA4KTtcblx0ICAgIHRoaXMuYWRkciA9IChwYWRkciArIHRoaXMuWSk7XG5cdCAgICBpZiAoIChwYWRkciAmIDB4MTAwKSAhPSAodGhpcy5hZGRyICYgMHgxMDApICkge1xuXHRcdCAgICB0aGlzLmN5Y2xlcyArPSA1O1xuXHQgICAgfSBlbHNlIHtcblx0XHQgICAgdGhpcy5jeWNsZXMgKz0gNDtcblx0ICAgIH1cbiAgICB9XG5cbiAgICByZWwoKSB7XG5cdCAgICB0aGlzLmFkZHIgPSB0aGlzLnJlYWQodGhpcy5QQysrKTtcblx0ICAgIGlmICh0aGlzLmFkZHIgJiAweDgwKSB7XG5cdFx0ICAgIHRoaXMuYWRkciAtPSAweDEwMDtcblx0ICAgIH1cblx0ICAgIHRoaXMuYWRkciArPSB0aGlzLlBDO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gMjtcbiAgICB9XG5cbiAgICBybXcoKSB7XG5cdCAgICB0aGlzLndyaXRlKHRoaXMuYWRkciwgdGhpcy50bXAgJiAweEZGKTtcblx0ICAgIHRoaXMuY3ljbGVzICs9IDI7XG4gICAgfVxuXG4gICAgZm56KHYpIHtcblx0ICAgIHRoaXMuWiA9ICgodiAmIDB4RkYpID09IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLk4gPSAoKHYgJiAweDgwKSAhPSAwKSA/IDEgOiAwO1xuICAgIH1cblxuICAgIC8vIEJvcnJvd1xuICAgIGZuemIodikge1xuXHQgICAgdGhpcy5aID0gKCh2ICYgMHhGRikgPT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuTiA9ICgodiAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLkMgPSAoKHYgJiAweDEwMCkgIT0gMCkgPyAwIDogMTtcbiAgICB9XG5cbiAgICAvLyBDYXJyeVxuICAgIGZuemModikge1xuXHQgICAgdGhpcy5aID0gKCh2ICYgMHhGRikgPT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuTiA9ICgodiAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLkMgPSAoKHYgJiAweDEwMCkgIT0gMCkgPyAxIDogMDtcbiAgICB9XG5cbiAgICBicmFuY2godikge1xuXHQgICAgaWYgKHYpIHtcblx0XHQgICAgaWYgKCAodGhpcy5hZGRyICYgMHgxMDApICE9ICh0aGlzLlBDICYgMHgxMDApICkge1xuXHRcdFx0ICAgIHRoaXMuY3ljbGVzICs9IDI7XG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0XHQgICAgdGhpcy5jeWNsZXMgKz0gMTtcblx0XHQgICAgfVxuXHRcdCAgICB0aGlzLlBDID0gdGhpcy5hZGRyO1xuXHQgICAgfVxuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gU3Vicm91dGluZXMgLSBpbnN0cnVjdGlvbnNcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGFkYygpIHtcblx0ICAgIHZhciB2ID0gdGhpcy5yZWFkKHRoaXMuYWRkcik7XG5cdCAgICB2YXIgYyA9IHRoaXMuQztcblx0ICAgIHZhciByID0gdGhpcy5BICsgdiArIGM7XG5cdCAgICBpZiAodGhpcy5EKSB7XG5cdFx0ICAgIHZhciBhbCA9ICh0aGlzLkEgJiAweDBGKSArICh2ICYgMHgwRikgKyBjO1xuXHRcdCAgICBpZiAoYWwgPiA5KSBhbCArPSA2O1xuXHRcdCAgICB2YXIgYWggPSAodGhpcy5BID4+IDQpICsgKHYgPj4gNCkgKyAoKGFsID4gMTUpID8gMSA6IDApO1xuXHRcdCAgICB0aGlzLlogPSAoKHIgJiAweEZGKSA9PSAwKSA/IDEgOiAwO1xuXHRcdCAgICB0aGlzLk4gPSAoKGFoICYgOCkgIT0gMCkgPyAxIDogMDtcblx0XHQgICAgdGhpcy5WID0gKCh+KHRoaXMuQSBeIHYpICYgKHRoaXMuQSBeIChhaCA8PCA0KSkgJiAweDgwKSAhPSAwKSA/IDEgOiAwO1xuXHRcdCAgICBpZiAoYWggPiA5KSBhaCArPSA2O1xuXHRcdCAgICB0aGlzLkMgPSAoYWggPiAxNSkgPyAxIDogMDtcblx0XHQgICAgdGhpcy5BID0gKChhaCA8PCA0KSB8IChhbCAmIDE1KSkgJiAweEZGO1xuXHQgICAgfSBlbHNlIHtcblx0XHQgICAgdGhpcy5aID0gKChyICYgMHhGRikgPT0gMCkgPyAxIDogMDtcblx0XHQgICAgdGhpcy5OID0gKChyICYgMHg4MCkgIT0gMCkgPyAxIDogMDtcblx0XHQgICAgdGhpcy5WID0gKCh+KHRoaXMuQSBeIHYpICYgKHRoaXMuQSBeIHIpICYgMHg4MCkgIT0gMCkgPyAxIDogMDtcblx0XHQgICAgdGhpcy5DID0gKChyICYgMHgxMDApICE9IDApID8gMSA6IDA7XG5cdFx0ICAgIHRoaXMuQSA9IHIgJiAweEZGO1xuXHQgICAgfVxuICAgIH1cblxuICAgIGFoeCgpIHtcblx0ICAgIHRoaXMudG1wID0gKCh0aGlzLmFkZHIgPj4gOCkgKyAxKSAmIHRoaXMuQSAmIHRoaXMuWDtcblx0ICAgIHRoaXMud3JpdGUodGhpcy5hZGRyLCB0aGlzLnRtcCAmIDB4RkYpO1xuICAgIH1cblxuICAgIGFscigpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5yZWFkKHRoaXMuYWRkcikgJiB0aGlzLkE7XG5cdCAgICB0aGlzLnRtcCA9ICgodGhpcy50bXAgJiAxKSA8PCA4KSB8ICh0aGlzLnRtcCA+PiAxKTtcblx0ICAgIHRoaXMuZm56Yyh0aGlzLnRtcCk7XG5cdCAgICB0aGlzLkEgPSB0aGlzLnRtcCAmIDB4RkY7XG4gICAgfVxuXG4gICAgYW5jKCkge1xuXHQgICAgdGhpcy50bXAgPSB0aGlzLnJlYWQodGhpcy5hZGRyKTtcblx0ICAgIHRoaXMudG1wIHw9ICgodGhpcy50bXAgJiAweDgwKSAmICh0aGlzLkEgJiAweDgwKSkgPDwgMTtcblx0ICAgIHRoaXMuZm56Yyh0aGlzLnRtcCk7XG5cdCAgICB0aGlzLkEgPSB0aGlzLnRtcCAmIDB4RkY7XG4gICAgfVxuXG4gICAgYW5kKCkge1xuXHQgICAgdGhpcy5BICY9IHRoaXMucmVhZCh0aGlzLmFkZHIpO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG5cbiAgICBhbmUoKSB7XG5cdCAgICB0aGlzLnRtcCA9IHRoaXMucmVhZCh0aGlzLmFkZHIpICYgdGhpcy5BICYgKHRoaXMuQSB8IDB4RUUpO1xuXHQgICAgdGhpcy5mbnoodGhpcy50bXApO1xuXHQgICAgdGhpcy5BID0gdGhpcy50bXAgJiAweEZGO1xuICAgIH1cblxuICAgIGFycigpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5yZWFkKHRoaXMuYWRmZHIpICYgdGhpcy5BO1xuXHQgICAgdGhpcy5DID0gKCh0aGlzLnRtcCAmIDB4ODApICE9IDApO1xuXHQgICAgdGhpcy5WID0gKCgoKHRoaXMudG1wID4+IDcpICYgMSkgXiAoKHRoaXMudG1wID4+IDYpICYgMSkpICE9IDApO1xuXHQgICAgaWYgKHRoaXMuRCkge1xuXHRcdCAgICB2YXIgYWwgPSAodGhpcy50bXAgJiAweDBGKSArICh0aGlzLnRtcCAmIDEpO1xuXHRcdCAgICBpZiAoYWwgPiA1KSBhbCArPSA2O1xuXHRcdCAgICB2YXIgYWggPSAoKHRoaXMudG1wID4+IDQpICYgMHgwRikgKyAoKHRoaXMudG1wID4+IDQpICYgMSk7XG5cdFx0ICAgIGlmIChhaCA+IDUpIHtcblx0XHRcdCAgICBhbCArPSA2O1xuXHRcdFx0ICAgIHRoaXMuQyA9IHRydWU7XG5cdFx0ICAgIH0gZWxzZSB7XG5cdFx0XHQgICAgdGhpcy5DID0gZmFsc2U7XG5cdFx0ICAgIH1cblx0XHQgICAgdGhpcy50bXAgPSAoYWggPDwgNCkgfCBhbDtcblx0ICAgIH1cblx0ICAgIHRoaXMuZm56KHRoaXMudG1wKTtcblx0ICAgIHRoaXMuQSA9IHRoaXMudG1wICYgMHhGRjtcbiAgICB9XG5cbiAgICBhc2woKSB7XG5cdCAgICB0aGlzLnRtcCA9IHRoaXMucmVhZCh0aGlzLmFkZHIpIDw8IDE7XG5cdCAgICB0aGlzLmZuemModGhpcy50bXApO1xuXHQgICAgdGhpcy50bXAgJj0gMHhGRjtcbiAgICB9XG4gICAgYXNsYSgpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5BIDw8IDE7XG5cdCAgICB0aGlzLmZuemModGhpcy50bXApO1xuXHQgICAgdGhpcy5BID0gdGhpcy50bXAgJiAweEZGO1xuICAgIH1cblxuICAgIGJpdCgpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5yZWFkKHRoaXMuYWRkcik7XG5cdCAgICB0aGlzLk4gPSAoKHRoaXMudG1wICYgMHg4MCkgIT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuViA9ICgodGhpcy50bXAgJiAweDQwKSAhPSAwKSA/IDEgOiAwO1xuXHQgICAgdGhpcy5aID0gKCh0aGlzLnRtcCAmIHRoaXMuQSkgPT0gMCkgPyAxIDogMDtcbiAgICB9XG5cbiAgICBicmsoKSB7XG5cdCAgICB0aGlzLlBDKys7XG5cdCAgICB0aGlzLndyaXRlKHRoaXMuUyArIDB4MTAwLCB0aGlzLlBDID4+IDgpO1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMud3JpdGUodGhpcy5TICsgMHgxMDAsIHRoaXMuUEMgJiAweEZGKTtcblx0ICAgIHRoaXMuUyA9ICh0aGlzLlMgLSAxKSAmIDB4RkY7XG5cdCAgICB2YXIgdiA9IHRoaXMuTiA8PCA3O1xuXHQgICAgdiB8PSB0aGlzLlYgPDwgNjtcblx0ICAgIHYgfD0gMyA8PCA0O1xuXHQgICAgdiB8PSB0aGlzLkQgPDwgMztcblx0ICAgIHYgfD0gdGhpcy5JIDw8IDI7XG5cdCAgICB2IHw9IHRoaXMuWiA8PCAxO1xuXHQgICAgdiB8PSB0aGlzLkM7XG5cdCAgICB0aGlzLndyaXRlKHRoaXMuUyArIDB4MTAwLCB2KTtcblx0ICAgIHRoaXMuUyA9ICh0aGlzLlMgLSAxKSAmIDB4RkY7XG5cdCAgICB0aGlzLkkgPSAxO1xuXHQgICAgdGhpcy5EID0gMDtcblx0ICAgIHRoaXMuUEMgPSAodGhpcy5yZWFkKDB4RkZGRikgPDwgOCkgfCB0aGlzLnJlYWQoMHhGRkZFKTtcblx0ICAgIHRoaXMuY3ljbGVzICs9IDU7XG4gICAgfVxuXG4gICAgYmNjKCkgeyB0aGlzLmJyYW5jaCggdGhpcy5DID09IDAgKTsgfVxuICAgIGJjcygpIHsgdGhpcy5icmFuY2goIHRoaXMuQyA9PSAxICk7IH1cbiAgICBiZXEoKSB7IHRoaXMuYnJhbmNoKCB0aGlzLlogPT0gMSApOyB9XG4gICAgYm5lKCkgeyB0aGlzLmJyYW5jaCggdGhpcy5aID09IDAgKTsgfVxuICAgIGJtaSgpIHsgdGhpcy5icmFuY2goIHRoaXMuTiA9PSAxICk7IH1cbiAgICBicGwoKSB7IHRoaXMuYnJhbmNoKCB0aGlzLk4gPT0gMCApOyB9XG4gICAgYnZjKCkgeyB0aGlzLmJyYW5jaCggdGhpcy5WID09IDAgKTsgfVxuICAgIGJ2cygpIHsgdGhpcy5icmFuY2goIHRoaXMuViA9PSAxICk7IH1cblxuXG4gICAgY2xjKCkgeyB0aGlzLkMgPSAwOyB9XG4gICAgY2xkKCkgeyB0aGlzLkQgPSAwOyB9XG4gICAgY2xpKCkgeyB0aGlzLkkgPSAwOyB9XG4gICAgY2x2KCkgeyB0aGlzLlYgPSAwOyB9XG5cbiAgICBjbXAoKSB7XG5cdCAgICB0aGlzLmZuemIoIHRoaXMuQSAtIHRoaXMucmVhZCh0aGlzLmFkZHIpICk7XG4gICAgfVxuXG4gICAgY3B4KCkge1xuXHQgICAgdGhpcy5mbnpiKCB0aGlzLlggLSB0aGlzLnJlYWQodGhpcy5hZGRyKSApO1xuICAgIH1cblxuICAgIGNweSgpIHtcblx0ICAgIHRoaXMuZm56YiggdGhpcy5ZIC0gdGhpcy5yZWFkKHRoaXMuYWRkcikgKTtcbiAgICB9XG5cbiAgICBkY3AoKSB7XG5cdCAgICB0aGlzLnRtcCA9ICh0aGlzLnJlYWQodGhpcy5hZGRyKSAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5BIC0gdGhpcy50bXA7XG5cdCAgICB0aGlzLmZueih0aGlzLnRtcCk7XG4gICAgfVxuXG4gICAgZGVjKCkge1xuXHQgICAgdGhpcy50bXAgPSAodGhpcy5yZWFkKHRoaXMuYWRkcikgLSAxKSAmIDB4RkY7XG5cdCAgICB0aGlzLmZueih0aGlzLnRtcCk7XG4gICAgfVxuXG4gICAgZGV4KCkge1xuXHQgICAgdGhpcy5YID0gKHRoaXMuWCAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuZm56KHRoaXMuWCk7XG4gICAgfVxuXG4gICAgZGV5KCkge1xuXHQgICAgdGhpcy5ZID0gKHRoaXMuWSAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuZm56KHRoaXMuWSk7XG4gICAgfVxuXG4gICAgZW9yKCkge1xuXHQgICAgdGhpcy5BIF49IHRoaXMucmVhZCh0aGlzLmFkZHIpO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG5cbiAgICBpbmMoKSB7XG5cdCAgICB0aGlzLnRtcCA9ICh0aGlzLnJlYWQodGhpcy5hZGRyKSArIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuZm56KHRoaXMudG1wKTtcbiAgICB9XG5cbiAgICBpbngoKSB7XG5cdCAgICB0aGlzLlggPSAodGhpcy5YICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy5mbnoodGhpcy5YKTtcbiAgICB9XG5cbiAgICBpbnkoKSB7XG5cdCAgICB0aGlzLlkgPSAodGhpcy5ZICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy5mbnoodGhpcy5ZKTtcbiAgICB9XG5cbiAgICBpc2MoKSB7XG5cdCAgICB2YXIgdiA9ICh0aGlzLnJlYWQodGhpcy5hZGRyKSArIDEpICYgMHhGRjtcblx0ICAgIHZhciBjID0gMSAtICh0aGlzLkMgPyAxIDogMCk7XG5cdCAgICB2YXIgciA9IHRoaXMuQSAtIHYgLSBjO1xuXHQgICAgaWYgKHRoaXMuRCkge1xuXHRcdCAgICB2YXIgYWwgPSAodGhpcy5BICYgMHgwRikgLSAodiAmIDB4MEYpIC0gYztcblx0XHQgICAgaWYgKGFsID4gMHg4MCkgYWwgLT0gNjtcblx0XHQgICAgdmFyIGFoID0gKHRoaXMuQSA+PiA0KSAtICh2ID4+IDQpIC0gKChhbCA+IDB4ODApID8gMSA6IDApO1xuXHRcdCAgICB0aGlzLlogPSAoKHIgJiAweEZGKSA9PSAwKTtcblx0XHQgICAgdGhpcy5OID0gKChyICYgMHg4MCkgIT0gMCk7XG5cdFx0ICAgIHRoaXMuViA9ICgoKHRoaXMuQSBeIHYpICYgKHRoaXMuQSBeIHIpICYgMHg4MCkgIT0gMCk7XG5cdFx0ICAgIHRoaXMuQyA9ICgodGhpcy5yICYgMHgxMDApICE9IDApID8gMCA6IDE7XG5cdFx0ICAgIGlmIChhaCA+IDB4ODApIGFoIC09IDY7XG5cdFx0ICAgIHRoaXMuQSA9ICgoYWggPDwgNCkgfCAoYWwgJiAxNSkpICYgMHhGRjtcblx0ICAgIH0gZWxzZSB7XG5cdFx0ICAgIHRoaXMuWiA9ICgociAmIDB4RkYpID09IDApO1xuXHRcdCAgICB0aGlzLk4gPSAoKHIgJiAweDgwKSAhPSAwKTtcblx0XHQgICAgdGhpcy5WID0gKCgodGhpcy5BIF4gdikgJiAodGhpcy5BIF4gcikgJiAweDgwKSAhPSAwKTtcblx0XHQgICAgdGhpcy5DID0gKChyICYgMHgxMDApICE9IDApID8gMCA6IDE7XG5cdFx0ICAgIHRoaXMuQSA9IHIgJiAweEZGO1xuXHQgICAgfVxuICAgIH1cblxuICAgIGptcCgpIHtcblx0ICAgIHRoaXMuUEMgPSB0aGlzLmFkZHI7XG5cdCAgICB0aGlzLmN5Y2xlcy0tO1xuICAgIH1cblxuICAgIGpzcigpIHtcblx0ICAgIHRoaXMud3JpdGUodGhpcy5TICsgMHgxMDAsICh0aGlzLlBDIC0gMSkgPj4gOCk7XG5cdCAgICB0aGlzLlMgPSAodGhpcy5TIC0gMSkgJiAweEZGO1xuXHQgICAgdGhpcy53cml0ZSh0aGlzLlMgKyAweDEwMCwgKHRoaXMuUEMgLSAxKSAmIDB4RkYpO1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuUEMgPSB0aGlzLmFkZHI7XG5cdCAgICB0aGlzLmN5Y2xlcyArPSAyO1xuICAgIH1cblxuICAgIGxhcygpIHtcblx0ICAgIHRoaXMuUyA9IHRoaXMuWCA9IHRoaXMuQSA9IHRoaXMucmVhZCh0aGlzLmFkZHIpICYgdGhpcy5TO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG5cbiAgICBsYXgoKSB7XG5cdCAgICB0aGlzLlggPSB0aGlzLkEgPSB0aGlzLnJlYWQodGhpcy5hZGRyKTtcblx0ICAgIHRoaXMuZm56KHRoaXMuQSk7XG4gICAgfVxuXG4gICAgbGRhKCkge1xuXHQgICAgdGhpcy5BID0gdGhpcy5yZWFkKHRoaXMuYWRkcik7XG5cdCAgICB0aGlzLmZueih0aGlzLkEpO1xuICAgIH1cblxuICAgIGxkeCgpIHtcblx0ICAgIHRoaXMuWCA9IHRoaXMucmVhZCh0aGlzLmFkZHIpO1xuXHQgICAgdGhpcy5mbnoodGhpcy5YKTtcbiAgICB9XG5cbiAgICBsZHkoKSB7XG5cdCAgICB0aGlzLlkgPSB0aGlzLnJlYWQodGhpcy5hZGRyKTtcblx0ICAgIHRoaXMuZm56KHRoaXMuWSk7XG4gICAgfVxuXG4gICAgb3JhKCkge1xuXHQgICAgdGhpcy5BIHw9IHRoaXMucmVhZCh0aGlzLmFkZHIpO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG5cbiAgICByb2woKSB7XG5cdCAgICB0aGlzLnRtcCA9ICh0aGlzLnJlYWQodGhpcy5hZGRyKSA8PCAxKSB8IHRoaXMuQztcblx0ICAgIHRoaXMuZm56Yyh0aGlzLnRtcCk7XG5cdCAgICB0aGlzLnRtcCAmPSAweEZGO1xuICAgIH1cbiAgICBybGEoKSB7XG5cdCAgICB0aGlzLnRtcCA9ICh0aGlzLkEgPDwgMSkgfCB0aGlzLkM7XG5cdCAgICB0aGlzLmZuemModGhpcy50bXApO1xuXHQgICAgdGhpcy5BID0gdGhpcy50bXAgJiAweEZGO1xuICAgIH1cblxuICAgIHJvcigpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5yZWFkKHRoaXMuYWRkcik7XG5cdCAgICB0aGlzLnRtcCA9ICgodGhpcy50bXAgJiAxKSA8PCA4KSB8ICh0aGlzLkMgPDwgNykgfCAodGhpcy50bXAgPj4gMSk7XG5cdCAgICB0aGlzLmZuemModGhpcy50bXApO1xuXHQgICAgdGhpcy50bXAgJj0gMHhGRjtcbiAgICB9XG4gICAgcnJhKCkge1xuXHQgICAgdGhpcy50bXAgPSAoKHRoaXMuQSAmIDEpIDw8IDgpIHwgKHRoaXMuQyA8PCA3KSB8ICh0aGlzLkEgPj4gMSk7XG5cdCAgICB0aGlzLmZuemModGhpcy50bXApO1xuXHQgICAgdGhpcy5BID0gdGhpcy50bXAgJiAweEZGO1xuICAgIH1cblxuXG4gICAgbHNyKCkge1xuXHQgICAgdGhpcy50bXAgPSB0aGlzLnJlYWQodGhpcy5hZGRyKTtcblx0ICAgIHRoaXMudG1wID0gKCh0aGlzLnRtcCAmIDEpIDw8IDgpIHwgKHRoaXMudG1wID4+IDEpO1xuXHQgICAgdGhpcy5mbnpjKHRoaXMudG1wKTtcblx0ICAgIHRoaXMudG1wICY9IDB4RkY7XG4gICAgfVxuICAgIGxzcmEoKSB7XG5cdCAgICB0aGlzLnRtcCA9ICgodGhpcy5BICYgMSkgPDwgOCkgfCAodGhpcy5BID4+IDEpO1xuXHQgICAgdGhpcy5mbnpjKHRoaXMudG1wKTtcblx0ICAgIHRoaXMuQSA9IHRoaXMudG1wICYgMHhGRjtcbiAgICB9XG5cblxuICAgIG5vcCgpIHsgfVxuXG4gICAgcGhhKCkge1xuXHQgICAgdGhpcy53cml0ZSh0aGlzLlMgKyAweDEwMCwgdGhpcy5BKTtcblx0ICAgIHRoaXMuUyA9ICh0aGlzLlMgLSAxKSAmIDB4RkY7XG5cdCAgICB0aGlzLmN5Y2xlcysrO1xuICAgIH1cblxuICAgIHBocCgpIHtcblx0ICAgIHZhciB2ID0gdGhpcy5OIDw8IDc7XG5cdCAgICB2IHw9IHRoaXMuViA8PCA2O1xuXHQgICAgdiB8PSAzIDw8IDQ7XG5cdCAgICB2IHw9IHRoaXMuRCA8PCAzO1xuXHQgICAgdiB8PSB0aGlzLkkgPDwgMjtcblx0ICAgIHYgfD0gdGhpcy5aIDw8IDE7XG5cdCAgICB2IHw9IHRoaXMuQztcblx0ICAgIHRoaXMud3JpdGUodGhpcy5TICsgMHgxMDAsIHYpO1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyAtIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuY3ljbGVzKys7XG4gICAgfVxuXG4gICAgcGxhKCkge1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyArIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuQSA9IHRoaXMucmVhZCh0aGlzLlMgKyAweDEwMCk7XG5cdCAgICB0aGlzLmZueih0aGlzLkEpO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gMjtcbiAgICB9XG5cbiAgICBwbHAoKSB7XG5cdCAgICB0aGlzLlMgPSAodGhpcy5TICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy50bXAgPSB0aGlzLnJlYWQodGhpcy5TICsgMHgxMDApO1xuXHQgICAgdGhpcy5OID0gKCh0aGlzLnRtcCAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLlYgPSAoKHRoaXMudG1wICYgMHg0MCkgIT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuRCA9ICgodGhpcy50bXAgJiAweDA4KSAhPSAwKSA/IDEgOiAwO1xuXHQgICAgdGhpcy5JID0gKCh0aGlzLnRtcCAmIDB4MDQpICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLlogPSAoKHRoaXMudG1wICYgMHgwMikgIT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuQyA9ICgodGhpcy50bXAgJiAweDAxKSAhPSAwKSA/IDEgOiAwO1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gMjtcbiAgICB9XG5cbiAgICBydGkoKSB7XG5cdCAgICB0aGlzLlMgPSAodGhpcy5TICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy50bXAgPSB0aGlzLnJlYWQodGhpcy5TICsgMHgxMDApO1xuXHQgICAgdGhpcy5OID0gKCh0aGlzLnRtcCAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLlYgPSAoKHRoaXMudG1wICYgMHg0MCkgIT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuRCA9ICgodGhpcy50bXAgJiAweDA4KSAhPSAwKSA/IDEgOiAwO1xuXHQgICAgdGhpcy5JID0gKCh0aGlzLnRtcCAmIDB4MDQpICE9IDApID8gMSA6IDA7XG5cdCAgICB0aGlzLlogPSAoKHRoaXMudG1wICYgMHgwMikgIT0gMCkgPyAxIDogMDtcblx0ICAgIHRoaXMuQyA9ICgodGhpcy50bXAgJiAweDAxKSAhPSAwKSA/IDEgOiAwO1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyArIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuUEMgPSB0aGlzLnJlYWQodGhpcy5TICsgMHgxMDApO1xuXHQgICAgdGhpcy5TID0gKHRoaXMuUyArIDEpICYgMHhGRjtcblx0ICAgIHRoaXMuUEMgfD0gdGhpcy5yZWFkKHRoaXMuUyArIDB4MTAwKSA8PCA4O1xuXHQgICAgdGhpcy5jeWNsZXMgKz0gNDtcbiAgICB9XG5cbiAgICBydHMoKSB7XG5cdCAgICB0aGlzLlMgPSAodGhpcy5TICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy5QQyA9IHRoaXMucmVhZCh0aGlzLlMgKyAweDEwMCk7XG5cdCAgICB0aGlzLlMgPSAodGhpcy5TICsgMSkgJiAweEZGO1xuXHQgICAgdGhpcy5QQyB8PSB0aGlzLnJlYWQodGhpcy5TICsgMHgxMDApIDw8IDg7XG5cdCAgICB0aGlzLlBDKys7XG5cdCAgICB0aGlzLmN5Y2xlcyArPSA0O1xuICAgIH1cblxuICAgIHNiYygpIHtcblx0ICAgIHZhciB2ID0gdGhpcy5yZWFkKHRoaXMuYWRkcik7XG5cdCAgICB2YXIgYyA9IDEgLSB0aGlzLkM7XG5cdCAgICB2YXIgciA9IHRoaXMuQSAtIHYgLSBjO1xuXHQgICAgaWYgKHRoaXMuRCkge1xuXHRcdCAgICB2YXIgYWwgPSAodGhpcy5BICYgMHgwRikgLSAodiAmIDB4MEYpIC0gYztcblx0XHQgICAgaWYgKGFsIDwgMCkgYWwgLT0gNjtcblx0XHQgICAgdmFyIGFoID0gKHRoaXMuQSA+PiA0KSAtICh2ID4+IDQpIC0gKChhbCA8IDApID8gMSA6IDApO1xuXHRcdCAgICB0aGlzLlogPSAoKHIgJiAweEZGKSA9PSAwKSA/IDEgOiAwO1xuXHRcdCAgICB0aGlzLk4gPSAoKHIgJiAweDgwKSAhPSAwKSA/IDEgOiAwO1xuXHRcdCAgICB0aGlzLlYgPSAoKCh0aGlzLkEgXiB2KSAmICh0aGlzLkEgXiByKSAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdFx0ICAgIHRoaXMuQyA9ICgociAmIDB4MTAwKSAhPSAwKSA/IDAgOiAxO1xuXHRcdCAgICBpZiAoYWggPCAwKSBhaCAtPSA2O1xuXHRcdCAgICB0aGlzLkEgPSAoKGFoIDw8IDQpIHwgKGFsICYgMTUpKSAmIDB4RkY7XG5cdCAgICB9IGVsc2Uge1xuXHRcdCAgICB0aGlzLlogPSAoKHIgJiAweEZGKSA9PSAwKSA/IDEgOiAwO1xuXHRcdCAgICB0aGlzLk4gPSAoKHIgJiAweDgwKSAhPSAwKSA/IDEgOiAwO1xuXHRcdCAgICB0aGlzLlYgPSAoKCh0aGlzLkEgXiB2KSAmICh0aGlzLkEgXiByKSAmIDB4ODApICE9IDApID8gMSA6IDA7XG5cdFx0ICAgIHRoaXMuQyA9ICgociAmIDB4MTAwKSAhPSAwKSA/IDAgOiAxO1xuXHRcdCAgICB0aGlzLkEgPSByICYgMHhGRjtcblx0ICAgIH1cbiAgICB9XG5cbiAgICBzYngoKSB7XG5cdCAgICB0aGlzLnRtcCA9IHRoaXMucmVhZCh0aGlzLmFkZHIpIC0gKHRoaXMuQSAmIHRoaXMuWCk7XG5cdCAgICB0aGlzLmZuemIodGhpcy50bXApO1xuXHQgICAgdGhpcy5YID0gKHRoaXMudG1wICYgMHhGRik7XG4gICAgfVxuXG4gICAgc2VjKCkgeyB0aGlzLkMgPSAxOyB9XG4gICAgc2VkKCkgeyB0aGlzLkQgPSAxOyB9XG4gICAgc2VpKCkgeyB0aGlzLkkgPSAxOyB9XG5cbiAgICBzaHMoKSB7XG5cdCAgICB0aGlzLnRtcCA9ICgodGhpcy5hZGRyID4+IDgpICsgMSkgJiB0aGlzLkEgJiB0aGlzLlg7XG5cdCAgICB0aGlzLndyaXRlKHRoaXMuYWRkciwgdGhpcy50bXAgJiAweEZGKTtcblx0ICAgIHRoaXMuUyA9ICh0aGlzLnRtcCAmIDB4RkYpO1xuICAgIH1cblxuICAgIHNoeCgpIHtcblx0ICAgIHRoaXMudG1wID0gKCh0aGlzLmFkZHIgPj4gOCkgKyAxKSAmIHRoaXMuWDtcblx0ICAgIHRoaXMud3JpdGUodGhpcy5hZGRyLCB0aGlzLnRtcCAmIDB4RkYpO1xuICAgIH1cblxuICAgIHNoeSgpIHtcblx0ICAgIHRoaXMudG1wID0gKCh0aGlzLmFkZHIgPj4gOCkgKyAxKSAmIHRoaXMuWTtcblx0ICAgIHRoaXMud3JpdGUodGhpcy5hZGRyLCB0aGlzLnRtcCAmIDB4RkYpO1xuICAgIH1cblxuICAgIHNsbygpIHtcblx0ICAgIHRoaXMudG1wID0gdGhpcy5yZWFkKHRoaXMuYWRkcikgPDwgMTtcblx0ICAgIHRoaXMudG1wIHw9IHRoaXMuQTtcblx0ICAgIHRoaXMuZm56Yyh0aGlzLnRtcCk7XG5cdCAgICB0aGlzLkEgPSB0aGlzLnRtcCAmIDB4RkY7XG4gICAgfVxuXG4gICAgc3JlKCkge1xuXHQgICAgdmFyIHYgPSB0aGlzLnJlYWQodGhpcy5hZGRyKTtcblx0ICAgIHRoaXMudG1wID0gKCh2ICYgMSkgPDwgOCkgfCAodiA+PiAxKTtcblx0ICAgIHRoaXMudG1wIF49IHRoaXMuQTtcblx0ICAgIHRoaXMuZm56Yyh0aGlzLnRtcCk7XG5cdCAgICB0aGlzLkEgPSB0aGlzLnRtcCAmIDB4RkY7XG4gICAgfVxuXG4gICAgc3RhKCkge1xuXHQgICAgdGhpcy53cml0ZSh0aGlzLmFkZHIsIHRoaXMuQSk7XG4gICAgfVxuXG4gICAgc3R4KCkge1xuXHQgICAgdGhpcy53cml0ZSh0aGlzLmFkZHIsIHRoaXMuWCk7XG4gICAgfVxuXG4gICAgc3R5KCkge1xuXHQgICAgdGhpcy53cml0ZSh0aGlzLmFkZHIsIHRoaXMuWSk7XG4gICAgfVxuXG4gICAgdGF4KCkge1xuXHQgICAgdGhpcy5YID0gdGhpcy5BO1xuXHQgICAgdGhpcy5mbnoodGhpcy5YKTtcbiAgICB9XG5cbiAgICB0YXkoKSB7XG5cdCAgICB0aGlzLlkgPSB0aGlzLkE7XG5cdCAgICB0aGlzLmZueih0aGlzLlkpO1xuICAgIH1cblxuICAgIHRzeCgpIHtcblx0ICAgIHRoaXMuWCA9IHRoaXMuUztcblx0ICAgIHRoaXMuZm56KHRoaXMuWCk7XG4gICAgfVxuXG4gICAgdHhhKCkge1xuXHQgICAgdGhpcy5BID0gdGhpcy5YO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG5cbiAgICB0eHMoKSB7XG5cdCAgICB0aGlzLlMgPSB0aGlzLlg7XG4gICAgfVxuXG4gICAgdHlhKCkge1xuXHQgICAgdGhpcy5BID0gdGhpcy5ZO1xuXHQgICAgdGhpcy5mbnoodGhpcy5BKTtcbiAgICB9XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIENQVSBpbnN0YW50aWF0aW9uXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnQge0NQVTY1MDJ9O1xuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIE9wY29kZSB0YWJsZVxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxudmFyIENQVTY1MDJvcCA9IG5ldyBBcnJheSgpO1xuXG4vKiAgQlJLICAgICAqLyBDUFU2NTAyb3BbMHgwMF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uYnJrKCk7IH07XG4vKiAgT1JBIGl6eCAqLyBDUFU2NTAyb3BbMHgwMV0gPSBmdW5jdGlvbihtKSB7IG0uaXp4KCk7IG0ub3JhKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHgwMl0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqU0xPIGl6eCAqLyBDUFU2NTAyb3BbMHgwM10gPSBmdW5jdGlvbihtKSB7IG0uaXp4KCk7IG0uc2xvKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIHpwICAqLyBDUFU2NTAyb3BbMHgwNF0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5ub3AoKTsgfTtcbi8qICBPUkEgenAgICovIENQVTY1MDJvcFsweDA1XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLm9yYSgpOyB9O1xuLyogIEFTTCB6cCAgKi8gQ1BVNjUwMm9wWzB4MDZdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uYXNsKCk7IG0ucm13KCk7IH07XG4vKiAqU0xPIHpwICAqLyBDUFU2NTAyb3BbMHgwN10gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5zbG8oKTsgbS5ybXcoKTsgfTtcbi8qICBQSFAgICAgICovIENQVTY1MDJvcFsweDA4XSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5waHAoKTsgfTtcbi8qICBPUkEgaW1tICovIENQVTY1MDJvcFsweDA5XSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5vcmEoKTsgfTtcbi8qICBBU0wgICAgICovIENQVTY1MDJvcFsweDBBXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5hc2xhKCk7IH07XG4vKiAqQU5DIGltbSAqLyBDUFU2NTAyb3BbMHgwQl0gPSBmdW5jdGlvbihtKSB7IG0uaW1tKCk7IG0uYW5jKCk7IH07XG4vKiAqTk9QIGFicyAqLyBDUFU2NTAyb3BbMHgwQ10gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0ubm9wKCk7IH07XG4vKiAgT1JBIGFicyAqLyBDUFU2NTAyb3BbMHgwRF0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0ub3JhKCk7IH07XG4vKiAgQVNMIGFicyAqLyBDUFU2NTAyb3BbMHgwRV0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0uYXNsKCk7IG0ucm13KCk7IH07XG4vKiAqU0xPIGFicyAqLyBDUFU2NTAyb3BbMHgwRl0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0uc2xvKCk7IG0ucm13KCk7IH07XG5cbi8qICBCUEwgcmVsICovIENQVTY1MDJvcFsweDEwXSA9IGZ1bmN0aW9uKG0pIHsgbS5yZWwoKTsgbS5icGwoKTsgfTtcbi8qICBPUkEgaXp5ICovIENQVTY1MDJvcFsweDExXSA9IGZ1bmN0aW9uKG0pIHsgbS5penkoKTsgbS5vcmEoKTsgfTtcbi8qICpLSUwgICAgICovIENQVTY1MDJvcFsweDEyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5raWwoKTsgfTtcbi8qICpTTE8gaXp5ICovIENQVTY1MDJvcFsweDEzXSA9IGZ1bmN0aW9uKG0pIHsgbS5penkoKTsgbS5zbG8oKTsgbS5ybXcoKTsgfTtcbi8qICpOT1AgenB4ICovIENQVTY1MDJvcFsweDE0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5ub3AoKTsgfTtcbi8qICBPUkEgenB4ICovIENQVTY1MDJvcFsweDE1XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5vcmEoKTsgfTtcbi8qICBBU0wgenB4ICovIENQVTY1MDJvcFsweDE2XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5hc2woKTsgbS5ybXcoKTsgfTtcbi8qICpTTE8genB4ICovIENQVTY1MDJvcFsweDE3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5zbG8oKTsgbS5ybXcoKTsgfTtcbi8qICBDTEMgICAgICovIENQVTY1MDJvcFsweDE4XSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5jbGMoKTsgfTtcbi8qICBPUkEgYWJ5ICovIENQVTY1MDJvcFsweDE5XSA9IGZ1bmN0aW9uKG0pIHsgbS5hYnkoKTsgbS5vcmEoKTsgfTtcbi8qICpOT1AgICAgICovIENQVTY1MDJvcFsweDFBXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5ub3AoKTsgfTtcbi8qICpTTE8gYWJ5ICovIENQVTY1MDJvcFsweDFCXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYnkoKTsgbS5zbG8oKTsgbS5ybXcoKTsgfTtcbi8qICpOT1AgYWJ4ICovIENQVTY1MDJvcFsweDFDXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5ub3AoKTsgfTtcbi8qICBPUkEgYWJ4ICovIENQVTY1MDJvcFsweDFEXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5vcmEoKTsgfTtcbi8qICBBU0wgYWJ4ICovIENQVTY1MDJvcFsweDFFXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5hc2woKTsgbS5ybXcoKTsgfTtcbi8qICpTTE8gYWJ4ICovIENQVTY1MDJvcFsweDFGXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5zbG8oKTsgbS5ybXcoKTsgfTtcblxuLyogIEpTUiBhYnMgKi8gQ1BVNjUwMm9wWzB4MjBdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmpzcigpOyB9O1xuLyogIEFORCBpenggKi8gQ1BVNjUwMm9wWzB4MjFdID0gZnVuY3Rpb24obSkgeyBtLml6eCgpOyBtLmFuZCgpOyB9O1xuLyogKktJTCAgICAgKi8gQ1BVNjUwMm9wWzB4MjJdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmtpbCgpOyB9O1xuLyogKlJMQSBpenggKi8gQ1BVNjUwMm9wWzB4MjNdID0gZnVuY3Rpb24obSkgeyBtLml6eCgpOyBtLnJsYSgpOyBtLnJtdygpOyB9O1xuLyogIEJJVCB6cCAgKi8gQ1BVNjUwMm9wWzB4MjRdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uYml0KCk7IH07XG4vKiAgQU5EIHpwICAqLyBDUFU2NTAyb3BbMHgyNV0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5hbmQoKTsgfTtcbi8qICBST0wgenAgICovIENQVTY1MDJvcFsweDI2XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLnJvbCgpOyBtLnJtdygpOyB9O1xuLyogKlJMQSB6cCAgKi8gQ1BVNjUwMm9wWzB4MjddID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0ucmxhKCk7IG0ucm13KCk7IH07XG4vKiAgUExQICAgICAqLyBDUFU2NTAyb3BbMHgyOF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ucGxwKCk7IH07XG4vKiAgQU5EIGltbSAqLyBDUFU2NTAyb3BbMHgyOV0gPSBmdW5jdGlvbihtKSB7IG0uaW1tKCk7IG0uYW5kKCk7IH07XG4vKiAgUk9MICAgICAqLyBDUFU2NTAyb3BbMHgyQV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ucmxhKCk7IH07XG4vKiAqQU5DIGltbSAqLyBDUFU2NTAyb3BbMHgyQl0gPSBmdW5jdGlvbihtKSB7IG0uaW1tKCk7IG0uYW5jKCk7IH07XG4vKiAgQklUIGFicyAqLyBDUFU2NTAyb3BbMHgyQ10gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0uYml0KCk7IH07XG4vKiAgQU5EIGFicyAqLyBDUFU2NTAyb3BbMHgyRF0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0uYW5kKCk7IH07XG4vKiAgUk9MIGFicyAqLyBDUFU2NTAyb3BbMHgyRV0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0ucm9sKCk7IG0ucm13KCk7IH07XG4vKiAqUkxBIGFicyAqLyBDUFU2NTAyb3BbMHgyRl0gPSBmdW5jdGlvbihtKSB7IG0uYWJzKCk7IG0ucmxhKCk7IG0ucm13KCk7IH07XG5cbi8qICBCTUkgcmVsICovIENQVTY1MDJvcFsweDMwXSA9IGZ1bmN0aW9uKG0pIHsgbS5yZWwoKTsgbS5ibWkoKTsgfTtcbi8qICBBTkQgaXp5ICovIENQVTY1MDJvcFsweDMxXSA9IGZ1bmN0aW9uKG0pIHsgbS5penkoKTsgbS5hbmQoKTsgfTtcbi8qICpLSUwgICAgICovIENQVTY1MDJvcFsweDMyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5raWwoKTsgfTtcbi8qICpSTEEgaXp5ICovIENQVTY1MDJvcFsweDMzXSA9IGZ1bmN0aW9uKG0pIHsgbS5penkoKTsgbS5ybGEoKTsgbS5ybXcoKTsgfTtcbi8qICpOT1AgenB4ICovIENQVTY1MDJvcFsweDM0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5ub3AoKTsgfTtcbi8qICBBTkQgenB4ICovIENQVTY1MDJvcFsweDM1XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5hbmQoKTsgfTtcbi8qICBST0wgenB4ICovIENQVTY1MDJvcFsweDM2XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5yb2woKTsgbS5ybXcoKTsgfTtcbi8qICpSTEEgenB4ICovIENQVTY1MDJvcFsweDM3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cHgoKTsgbS5ybGEoKTsgbS5ybXcoKTsgfTtcbi8qICBTRUMgICAgICovIENQVTY1MDJvcFsweDM4XSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5zZWMoKTsgfTtcbi8qICBBTkQgYWJ5ICovIENQVTY1MDJvcFsweDM5XSA9IGZ1bmN0aW9uKG0pIHsgbS5hYnkoKTsgbS5hbmQoKTsgfTtcbi8qICpOT1AgICAgICovIENQVTY1MDJvcFsweDNBXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5ub3AoKTsgfTtcbi8qICpSTEEgYWJ5ICovIENQVTY1MDJvcFsweDNCXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYnkoKTsgbS5ybGEoKTsgbS5ybXcoKTsgfTtcbi8qICpOT1AgYWJ4ICovIENQVTY1MDJvcFsweDNDXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5ub3AoKTsgfTtcbi8qICBBTkQgYWJ4ICovIENQVTY1MDJvcFsweDNEXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5hbmQoKTsgfTtcbi8qICBST0wgYWJ4ICovIENQVTY1MDJvcFsweDNFXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5yb2woKTsgbS5ybXcoKTsgfTtcbi8qICpSTEEgYWJ4ICovIENQVTY1MDJvcFsweDNGXSA9IGZ1bmN0aW9uKG0pIHsgbS5hYngoKTsgbS5ybGEoKTsgbS5ybXcoKTsgfTtcblxuLyogIFJUSSAgICAgKi8gQ1BVNjUwMm9wWzB4NDBdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnJ0aSgpOyB9O1xuLyogIEVPUiBpenggKi8gQ1BVNjUwMm9wWzB4NDFdID0gZnVuY3Rpb24obSkgeyBtLml6eCgpOyBtLmVvcigpOyB9O1xuLyogKktJTCAgICAgKi8gQ1BVNjUwMm9wWzB4NDJdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmtpbCgpOyB9O1xuLyogKlNSRSBpenggKi8gQ1BVNjUwMm9wWzB4NDNdID0gZnVuY3Rpb24obSkgeyBtLml6eCgpOyBtLnNyZSgpOyBtLnJtdygpOyB9O1xuLyogKk5PUCB6cCAgKi8gQ1BVNjUwMm9wWzB4NDRdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0ubm9wKCk7IH07XG4vKiAgRU9SIHpwICAqLyBDUFU2NTAyb3BbMHg0NV0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5lb3IoKTsgfTtcbi8qICBMU1IgenAgICovIENQVTY1MDJvcFsweDQ2XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmxzcigpOyBtLnJtdygpOyB9O1xuLyogKlNSRSB6cCAgKi8gQ1BVNjUwMm9wWzB4NDddID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uc3JlKCk7IG0ucm13KCk7IH07XG4vKiAgUEhBICAgICAqLyBDUFU2NTAyb3BbMHg0OF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ucGhhKCk7IH07XG4vKiAgRU9SIGltbSAqLyBDUFU2NTAyb3BbMHg0OV0gPSBmdW5jdGlvbihtKSB7IG0uaW1tKCk7IG0uZW9yKCk7IH07XG4vKiAgTFNSICAgICAqLyBDUFU2NTAyb3BbMHg0QV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ubHNyYSgpOyB9O1xuLyogKkFMUiBpbW0gKi8gQ1BVNjUwMm9wWzB4NEJdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmFscigpOyB9O1xuLyogIEpNUCBhYnMgKi8gQ1BVNjUwMm9wWzB4NENdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmptcCgpOyB9O1xuLyogIEVPUiBhYnMgKi8gQ1BVNjUwMm9wWzB4NERdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmVvcigpOyB9O1xuLyogIExTUiBhYnMgKi8gQ1BVNjUwMm9wWzB4NEVdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmxzcigpOyBtLnJtdygpOyB9O1xuLyogKlNSRSBhYnMgKi8gQ1BVNjUwMm9wWzB4NEZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnNyZSgpOyBtLnJtdygpOyB9O1xuXG4vKiAgQlZDIHJlbCAqLyBDUFU2NTAyb3BbMHg1MF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYnZjKCk7IH07XG4vKiAgRU9SIGl6eSAqLyBDUFU2NTAyb3BbMHg1MV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uZW9yKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHg1Ml0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqU1JFIGl6eSAqLyBDUFU2NTAyb3BbMHg1M10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uc3JlKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIHpweCAqLyBDUFU2NTAyb3BbMHg1NF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubm9wKCk7IH07XG4vKiAgRU9SIHpweCAqLyBDUFU2NTAyb3BbMHg1NV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uZW9yKCk7IH07XG4vKiAgTFNSIHpweCAqLyBDUFU2NTAyb3BbMHg1Nl0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubHNyKCk7IG0ucm13KCk7IH07XG4vKiAqU1JFIHpweCAqLyBDUFU2NTAyb3BbMHg1N10gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uc3JlKCk7IG0ucm13KCk7IH07XG4vKiAgQ0xJICAgICAqLyBDUFU2NTAyb3BbMHg1OF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uY2xpKCk7IH07XG4vKiAgRU9SIGFieSAqLyBDUFU2NTAyb3BbMHg1OV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uZW9yKCk7IH07XG4vKiAqTk9QICAgICAqLyBDUFU2NTAyb3BbMHg1QV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ubm9wKCk7IH07XG4vKiAqU1JFIGFieSAqLyBDUFU2NTAyb3BbMHg1Ql0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uc3JlKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIGFieCAqLyBDUFU2NTAyb3BbMHg1Q10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubm9wKCk7IH07XG4vKiAgRU9SIGFieCAqLyBDUFU2NTAyb3BbMHg1RF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uZW9yKCk7IH07XG4vKiAgTFNSIGFieCAqLyBDUFU2NTAyb3BbMHg1RV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubHNyKCk7IG0ucm13KCk7IH07XG4vKiAqU1JFIGFieCAqLyBDUFU2NTAyb3BbMHg1Rl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uc3JlKCk7IG0ucm13KCk7IH07XG5cbi8qICBSVFMgICAgICovIENQVTY1MDJvcFsweDYwXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5ydHMoKTsgfTtcbi8qICBBREMgaXp4ICovIENQVTY1MDJvcFsweDYxXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5hZGMoKTsgfTtcbi8qICpLSUwgICAgICovIENQVTY1MDJvcFsweDYyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbXAoKTsgbS5raWwoKTsgfTtcbi8qICpSUkEgaXp4ICovIENQVTY1MDJvcFsweDYzXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5ycmEoKTsgbS5ybXcoKTsgfTtcbi8qICpOT1AgenAgICovIENQVTY1MDJvcFsweDY0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLm5vcCgpOyB9O1xuLyogIEFEQyB6cCAgKi8gQ1BVNjUwMm9wWzB4NjVdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uYWRjKCk7IH07XG4vKiAgUk9SIHpwICAqLyBDUFU2NTAyb3BbMHg2Nl0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5yb3IoKTsgbS5ybXcoKTsgfTtcbi8qICpSUkEgenAgICovIENQVTY1MDJvcFsweDY3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLnJyYSgpOyBtLnJtdygpOyB9O1xuLyogIFBMQSAgICAgKi8gQ1BVNjUwMm9wWzB4NjhdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnBsYSgpOyB9O1xuLyogIEFEQyBpbW0gKi8gQ1BVNjUwMm9wWzB4NjldID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmFkYygpOyB9O1xuLyogIFJPUiAgICAgKi8gQ1BVNjUwMm9wWzB4NkFdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnJyYSgpOyB9O1xuLyogKkFSUiBpbW0gKi8gQ1BVNjUwMm9wWzB4NkJdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmFycigpOyB9O1xuLyogIEpNUCBpbmQgKi8gQ1BVNjUwMm9wWzB4NkNdID0gZnVuY3Rpb24obSkgeyBtLmluZCgpOyBtLmptcCgpOyB9O1xuLyogIEFEQyBhYnMgKi8gQ1BVNjUwMm9wWzB4NkRdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmFkYygpOyB9O1xuLyogIFJPUiBhYnMgKi8gQ1BVNjUwMm9wWzB4NkVdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnJvcigpOyBtLnJtdygpOyB9O1xuLyogKlJSQSBhYnMgKi8gQ1BVNjUwMm9wWzB4NkZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnJyYSgpOyBtLnJtdygpOyB9O1xuXG4vKiAgQlZTIHJlbCAqLyBDUFU2NTAyb3BbMHg3MF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYnZzKCk7IH07XG4vKiAgQURDIGl6eSAqLyBDUFU2NTAyb3BbMHg3MV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uYWRjKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHg3Ml0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqUlJBIGl6eSAqLyBDUFU2NTAyb3BbMHg3M10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0ucnJhKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIHpweCAqLyBDUFU2NTAyb3BbMHg3NF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubm9wKCk7IH07XG4vKiAgQURDIHpweCAqLyBDUFU2NTAyb3BbMHg3NV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uYWRjKCk7IH07XG4vKiAgUk9SIHpweCAqLyBDUFU2NTAyb3BbMHg3Nl0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ucm9yKCk7IG0ucm13KCk7IH07XG4vKiAqUlJBIHpweCAqLyBDUFU2NTAyb3BbMHg3N10gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ucnJhKCk7IG0ucm13KCk7IH07XG4vKiAgU0VJICAgICAqLyBDUFU2NTAyb3BbMHg3OF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uc2VpKCk7IH07XG4vKiAgQURDIGFieSAqLyBDUFU2NTAyb3BbMHg3OV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uYWRjKCk7IH07XG4vKiAqTk9QICAgICAqLyBDUFU2NTAyb3BbMHg3QV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ubm9wKCk7IH07XG4vKiAqUlJBIGFieSAqLyBDUFU2NTAyb3BbMHg3Ql0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0ucnJhKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIGFieCAqLyBDUFU2NTAyb3BbMHg3Q10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubm9wKCk7IH07XG4vKiAgQURDIGFieCAqLyBDUFU2NTAyb3BbMHg3RF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uYWRjKCk7IH07XG4vKiAgUk9SIGFieCAqLyBDUFU2NTAyb3BbMHg3RV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ucm9yKCk7IG0ucm13KCk7IH07XG4vKiAqUlJBIGFieCAqLyBDUFU2NTAyb3BbMHg3Rl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ucnJhKCk7IG0ucm13KCk7IH07XG5cbi8qICpOT1AgaW1tICovIENQVTY1MDJvcFsweDgwXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5ub3AoKTsgfTtcbi8qICBTVEEgaXp4ICovIENQVTY1MDJvcFsweDgxXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5zdGEoKTsgfTtcbi8qICpOT1AgaW1tICovIENQVTY1MDJvcFsweDgyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5ub3AoKTsgfTtcbi8qICpTQVggaXp4ICovIENQVTY1MDJvcFsweDgzXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5zYXgoKTsgfTtcbi8qICBTVFkgenAgICovIENQVTY1MDJvcFsweDg0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLnN0eSgpOyB9O1xuLyogIFNUQSB6cCAgKi8gQ1BVNjUwMm9wWzB4ODVdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uc3RhKCk7IH07XG4vKiAgU1RYIHpwICAqLyBDUFU2NTAyb3BbMHg4Nl0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5zdHgoKTsgfTtcbi8qICpTQVggenAgICovIENQVTY1MDJvcFsweDg3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLnNheCgpOyB9O1xuLyogIERFWSAgICAgKi8gQ1BVNjUwMm9wWzB4ODhdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmRleSgpOyB9O1xuLyogKk5PUCBpbW0gKi8gQ1BVNjUwMm9wWzB4ODldID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLm5vcCgpOyB9O1xuLyogIFRYQSAgICAgKi8gQ1BVNjUwMm9wWzB4OEFdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnR4YSgpOyB9O1xuLyogKlhBQSBpbW0gKi8gQ1BVNjUwMm9wWzB4OEJdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLnhhYSgpOyB9O1xuLyogIFNUWSBhYnMgKi8gQ1BVNjUwMm9wWzB4OENdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnN0eSgpOyB9O1xuLyogIFNUQSBhYnMgKi8gQ1BVNjUwMm9wWzB4OERdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnN0YSgpOyB9O1xuLyogIFNUWCBhYnMgKi8gQ1BVNjUwMm9wWzB4OEVdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnN0eCgpOyB9O1xuLyogKlNBWCBhYnMgKi8gQ1BVNjUwMm9wWzB4OEZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnNheCgpOyB9O1xuXG4vKiAgQkNDIHJlbCAqLyBDUFU2NTAyb3BbMHg5MF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYmNjKCk7IH07XG4vKiAgU1RBIGl6eSAqLyBDUFU2NTAyb3BbMHg5MV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uc3RhKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHg5Ml0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqQUhYIGl6eSAqLyBDUFU2NTAyb3BbMHg5M10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uYWh4KCk7IH07XG4vKiAgU1RZIHpweCAqLyBDUFU2NTAyb3BbMHg5NF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uc3R5KCk7IH07XG4vKiAgU1RBIHpweCAqLyBDUFU2NTAyb3BbMHg5NV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uc3RhKCk7IH07XG4vKiAgU1RYIHpweSAqLyBDUFU2NTAyb3BbMHg5Nl0gPSBmdW5jdGlvbihtKSB7IG0uenB5KCk7IG0uc3R4KCk7IH07XG4vKiAqU0FYIHpweSAqLyBDUFU2NTAyb3BbMHg5N10gPSBmdW5jdGlvbihtKSB7IG0uenB5KCk7IG0uc2F4KCk7IH07XG4vKiAgVFlBICAgICAqLyBDUFU2NTAyb3BbMHg5OF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0udHlhKCk7IH07XG4vKiAgU1RBIGFieSAqLyBDUFU2NTAyb3BbMHg5OV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uc3RhKCk7IH07XG4vKiAgVFhTICAgICAqLyBDUFU2NTAyb3BbMHg5QV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0udHhzKCk7IH07XG4vKiAqVEFTIGFieSAqLyBDUFU2NTAyb3BbMHg5Ql0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0udGFzKCk7IH07XG4vKiAqU0hZIGFieCAqLyBDUFU2NTAyb3BbMHg5Q10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uc2h5KCk7IH07XG4vKiAgU1RBIGFieCAqLyBDUFU2NTAyb3BbMHg5RF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uc3RhKCk7IH07XG4vKiAqU0hYIGFieSAqLyBDUFU2NTAyb3BbMHg5RV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uc2h4KCk7IH07XG4vKiAqQUhYIGFieSAqLyBDUFU2NTAyb3BbMHg5Rl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uYWh4KCk7IH07XG5cbi8qICBMRFkgaW1tICovIENQVTY1MDJvcFsweEEwXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5sZHkoKTsgfTtcbi8qICBMREEgaXp4ICovIENQVTY1MDJvcFsweEExXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5sZGEoKTsgfTtcbi8qICBMRFggaW1tICovIENQVTY1MDJvcFsweEEyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5sZHgoKTsgfTtcbi8qICpMQVggaXp4ICovIENQVTY1MDJvcFsweEEzXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5sYXgoKTsgfTtcbi8qICBMRFkgenAgICovIENQVTY1MDJvcFsweEE0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmxkeSgpOyB9O1xuLyogIExEQSB6cCAgKi8gQ1BVNjUwMm9wWzB4QTVdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0ubGRhKCk7IH07XG4vKiAgTERYIHpwICAqLyBDUFU2NTAyb3BbMHhBNl0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5sZHgoKTsgfTtcbi8qICpMQVggenAgICovIENQVTY1MDJvcFsweEE3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmxheCgpOyB9O1xuLyogIFRBWSAgICAgKi8gQ1BVNjUwMm9wWzB4QThdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnRheSgpOyB9O1xuLyogIExEQSBpbW0gKi8gQ1BVNjUwMm9wWzB4QTldID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmxkYSgpOyB9O1xuLyogIFRBWCAgICAgKi8gQ1BVNjUwMm9wWzB4QUFdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLnRheCgpOyB9O1xuLyogKkxBWCBpbW0gKi8gQ1BVNjUwMm9wWzB4QUJdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmxheCgpOyB9O1xuLyogIExEWSBhYnMgKi8gQ1BVNjUwMm9wWzB4QUNdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmxkeSgpOyB9O1xuLyogIExEQSBhYnMgKi8gQ1BVNjUwMm9wWzB4QURdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmxkYSgpOyB9O1xuLyogIExEWCBhYnMgKi8gQ1BVNjUwMm9wWzB4QUVdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmxkeCgpOyB9O1xuLyogKkxBWCBhYnMgKi8gQ1BVNjUwMm9wWzB4QUZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmxheCgpOyB9O1xuXG4vKiAgQkNTIHJlbCAqLyBDUFU2NTAyb3BbMHhCMF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYmNzKCk7IH07XG4vKiAgTERBIGl6eSAqLyBDUFU2NTAyb3BbMHhCMV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0ubGRhKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHhCMl0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqTEFYIGl6eSAqLyBDUFU2NTAyb3BbMHhCM10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0ubGF4KCk7IH07XG4vKiAgTERZIHpweCAqLyBDUFU2NTAyb3BbMHhCNF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubGR5KCk7IH07XG4vKiAgTERBIHpweCAqLyBDUFU2NTAyb3BbMHhCNV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubGRhKCk7IH07XG4vKiAgTERYIHpweSAqLyBDUFU2NTAyb3BbMHhCNl0gPSBmdW5jdGlvbihtKSB7IG0uenB5KCk7IG0ubGR4KCk7IH07XG4vKiAqTEFYIHpweSAqLyBDUFU2NTAyb3BbMHhCN10gPSBmdW5jdGlvbihtKSB7IG0uenB5KCk7IG0ubGF4KCk7IH07XG4vKiAgQ0xWICAgICAqLyBDUFU2NTAyb3BbMHhCOF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uY2x2KCk7IH07XG4vKiAgTERBIGFieSAqLyBDUFU2NTAyb3BbMHhCOV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0ubGRhKCk7IH07XG4vKiAgVFNYICAgICAqLyBDUFU2NTAyb3BbMHhCQV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0udHN4KCk7IH07XG4vKiAqTEFTIGFieSAqLyBDUFU2NTAyb3BbMHhCQl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0ubGFzKCk7IH07XG4vKiAgTERZIGFieCAqLyBDUFU2NTAyb3BbMHhCQ10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubGR5KCk7IH07XG4vKiAgTERBIGFieCAqLyBDUFU2NTAyb3BbMHhCRF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubGRhKCk7IH07XG4vKiAgTERYIGFieSAqLyBDUFU2NTAyb3BbMHhCRV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0ubGR4KCk7IH07XG4vKiAqTEFYIGFieSAqLyBDUFU2NTAyb3BbMHhCRl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0ubGF4KCk7IH07XG5cbi8qICBDUFkgaW1tICovIENQVTY1MDJvcFsweEMwXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5jcHkoKTsgfTtcbi8qICBDTVAgaXp4ICovIENQVTY1MDJvcFsweEMxXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5jbXAoKTsgfTtcbi8qICpOT1AgaW1tICovIENQVTY1MDJvcFsweEMyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5ub3AoKTsgfTtcbi8qICpEQ1AgaXp4ICovIENQVTY1MDJvcFsweEMzXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5kY3AoKTsgbS5ybXcoKTsgfTtcbi8qICBDUFkgenAgICovIENQVTY1MDJvcFsweEM0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmNweSgpOyB9O1xuLyogIENNUCB6cCAgKi8gQ1BVNjUwMm9wWzB4QzVdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uY21wKCk7IH07XG4vKiAgREVDIHpwICAqLyBDUFU2NTAyb3BbMHhDNl0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5kZWMoKTsgbS5ybXcoKTsgfTtcbi8qICpEQ1AgenAgICovIENQVTY1MDJvcFsweEM3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmRjcCgpOyBtLnJtdygpOyB9O1xuLyogIElOWSAgICAgKi8gQ1BVNjUwMm9wWzB4QzhdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmlueSgpOyB9O1xuLyogIENNUCBpbW0gKi8gQ1BVNjUwMm9wWzB4QzldID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmNtcCgpOyB9O1xuLyogIERFWCAgICAgKi8gQ1BVNjUwMm9wWzB4Q0FdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmRleCgpOyB9O1xuLyogKkFYUyBpbW0gKi8gQ1BVNjUwMm9wWzB4Q0JdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLmF4cygpOyB9O1xuLyogIENQWSBhYnMgKi8gQ1BVNjUwMm9wWzB4Q0NdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmNweSgpOyB9O1xuLyogIENNUCBhYnMgKi8gQ1BVNjUwMm9wWzB4Q0RdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmNtcCgpOyB9O1xuLyogIERFQyBhYnMgKi8gQ1BVNjUwMm9wWzB4Q0VdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmRlYygpOyBtLnJtdygpOyB9O1xuLyogKkRDUCBhYnMgKi8gQ1BVNjUwMm9wWzB4Q0ZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmRjcCgpOyBtLnJtdygpOyB9O1xuXG4vKiAgQk5FIHJlbCAqLyBDUFU2NTAyb3BbMHhEMF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYm5lKCk7IH07XG4vKiAgQ01QIGl6eSAqLyBDUFU2NTAyb3BbMHhEMV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uY21wKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHhEMl0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqRENQIGl6eSAqLyBDUFU2NTAyb3BbMHhEM10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uZGNwKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIHpweCAqLyBDUFU2NTAyb3BbMHhENF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubm9wKCk7IH07XG4vKiAgQ01QIHpweCAqLyBDUFU2NTAyb3BbMHhENV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uY21wKCk7IH07XG4vKiAgREVDIHpweCAqLyBDUFU2NTAyb3BbMHhENl0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uZGVjKCk7IG0ucm13KCk7IH07XG4vKiAqRENQIHpweCAqLyBDUFU2NTAyb3BbMHhEN10gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uZGNwKCk7IG0ucm13KCk7IH07XG4vKiAgQ0xEICAgICAqLyBDUFU2NTAyb3BbMHhEOF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uY2xkKCk7IH07XG4vKiAgQ01QIGFieSAqLyBDUFU2NTAyb3BbMHhEOV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uY21wKCk7IH07XG4vKiAqTk9QICAgICAqLyBDUFU2NTAyb3BbMHhEQV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ubm9wKCk7IH07XG4vKiAqRENQIGFieSAqLyBDUFU2NTAyb3BbMHhEQl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uZGNwKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIGFieCAqLyBDUFU2NTAyb3BbMHhEQ10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubm9wKCk7IH07XG4vKiAgQ01QIGFieCAqLyBDUFU2NTAyb3BbMHhERF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uY21wKCk7IH07XG4vKiAgREVDIGFieCAqLyBDUFU2NTAyb3BbMHhERV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uZGVjKCk7IG0ucm13KCk7IH07XG4vKiAqRENQIGFieCAqLyBDUFU2NTAyb3BbMHhERl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uZGNwKCk7IG0ucm13KCk7IH07XG5cbi8qICBDUFggaW1tICovIENQVTY1MDJvcFsweEUwXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5jcHgoKTsgfTtcbi8qICBTQkMgaXp4ICovIENQVTY1MDJvcFsweEUxXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5zYmMoKTsgfTtcbi8qICpOT1AgaW1tICovIENQVTY1MDJvcFsweEUyXSA9IGZ1bmN0aW9uKG0pIHsgbS5pbW0oKTsgbS5ub3AoKTsgfTtcbi8qICpJU0MgaXp4ICovIENQVTY1MDJvcFsweEUzXSA9IGZ1bmN0aW9uKG0pIHsgbS5pengoKTsgbS5pc2MoKTsgbS5ybXcoKTsgfTtcbi8qICBDUFggenAgICovIENQVTY1MDJvcFsweEU0XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmNweCgpOyB9O1xuLyogIFNCQyB6cCAgKi8gQ1BVNjUwMm9wWzB4RTVdID0gZnVuY3Rpb24obSkgeyBtLnpwKCk7IG0uc2JjKCk7IH07XG4vKiAgSU5DIHpwICAqLyBDUFU2NTAyb3BbMHhFNl0gPSBmdW5jdGlvbihtKSB7IG0uenAoKTsgbS5pbmMoKTsgbS5ybXcoKTsgfTtcbi8qICpJU0MgenAgICovIENQVTY1MDJvcFsweEU3XSA9IGZ1bmN0aW9uKG0pIHsgbS56cCgpOyBtLmlzYygpOyBtLnJtdygpOyB9O1xuLyogIElOWCAgICAgKi8gQ1BVNjUwMm9wWzB4RThdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLmlueCgpOyB9O1xuLyogIFNCQyBpbW0gKi8gQ1BVNjUwMm9wWzB4RTldID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLnNiYygpOyB9O1xuLyogIE5PUCAgICAgKi8gQ1BVNjUwMm9wWzB4RUFdID0gZnVuY3Rpb24obSkgeyBtLmltcCgpOyBtLm5vcCgpOyB9O1xuLyogKlNCQyBpbW0gKi8gQ1BVNjUwMm9wWzB4RUJdID0gZnVuY3Rpb24obSkgeyBtLmltbSgpOyBtLnNiYygpOyB9O1xuLyogIENQWCBhYnMgKi8gQ1BVNjUwMm9wWzB4RUNdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmNweCgpOyB9O1xuLyogIFNCQyBhYnMgKi8gQ1BVNjUwMm9wWzB4RURdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLnNiYygpOyB9O1xuLyogIElOQyBhYnMgKi8gQ1BVNjUwMm9wWzB4RUVdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmluYygpOyBtLnJtdygpOyB9O1xuLyogKklTQyBhYnMgKi8gQ1BVNjUwMm9wWzB4RUZdID0gZnVuY3Rpb24obSkgeyBtLmFicygpOyBtLmlzYygpOyBtLnJtdygpOyB9O1xuXG4vKiAgQkVRIHJlbCAqLyBDUFU2NTAyb3BbMHhGMF0gPSBmdW5jdGlvbihtKSB7IG0ucmVsKCk7IG0uYmVxKCk7IH07XG4vKiAgU0JDIGl6eSAqLyBDUFU2NTAyb3BbMHhGMV0gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uc2JjKCk7IH07XG4vKiAqS0lMICAgICAqLyBDUFU2NTAyb3BbMHhGMl0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ua2lsKCk7IH07XG4vKiAqSVNDIGl6eSAqLyBDUFU2NTAyb3BbMHhGM10gPSBmdW5jdGlvbihtKSB7IG0uaXp5KCk7IG0uaXNjKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIHpweCAqLyBDUFU2NTAyb3BbMHhGNF0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0ubm9wKCk7IH07XG4vKiAgU0JDIHpweCAqLyBDUFU2NTAyb3BbMHhGNV0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uc2JjKCk7IH07XG4vKiAgSU5DIHpweCAqLyBDUFU2NTAyb3BbMHhGNl0gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uaW5jKCk7IG0ucm13KCk7IH07XG4vKiAqSVNDIHpweCAqLyBDUFU2NTAyb3BbMHhGN10gPSBmdW5jdGlvbihtKSB7IG0uenB4KCk7IG0uaXNjKCk7IG0ucm13KCk7IH07XG4vKiAgU0VEICAgICAqLyBDUFU2NTAyb3BbMHhGOF0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0uc2VkKCk7IH07XG4vKiAgU0JDIGFieSAqLyBDUFU2NTAyb3BbMHhGOV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uc2JjKCk7IH07XG4vKiAqTk9QICAgICAqLyBDUFU2NTAyb3BbMHhGQV0gPSBmdW5jdGlvbihtKSB7IG0uaW1wKCk7IG0ubm9wKCk7IH07XG4vKiAqSVNDIGFieSAqLyBDUFU2NTAyb3BbMHhGQl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ5KCk7IG0uaXNjKCk7IG0ucm13KCk7IH07XG4vKiAqTk9QIGFieCAqLyBDUFU2NTAyb3BbMHhGQ10gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0ubm9wKCk7IH07XG4vKiAgU0JDIGFieCAqLyBDUFU2NTAyb3BbMHhGRF0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uc2JjKCk7IH07XG4vKiAgSU5DIGFieCAqLyBDUFU2NTAyb3BbMHhGRV0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uaW5jKCk7IG0ucm13KCk7IH07XG4vKiAqSVNDIGFieCAqLyBDUFU2NTAyb3BbMHhGRl0gPSBmdW5jdGlvbihtKSB7IG0uYWJ4KCk7IG0uaXNjKCk7IG0ucm13KCk7IH07XG5cbmV4cG9ydCBkZWZhdWx0IENQVTY1MDJvcDtcbiJdLCJzb3VyY2VSb290IjoiIn0=