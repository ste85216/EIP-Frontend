export const quotationSchema = {
  quotationNumber: '',
  date: new Date(),
  customerName: '',
  customerAddress: '',
  customerTaxId: '',
  customerContact: '',
  customerDepartment: '',
  customerPhone: '',
  customerEmail: '',
  customerMobile: '',
  projectType: '',
  projectName: '',
  workDays: '',
  specialNote: '',
  validityDays: '',
  delayDays: '',
  includeContract: false,
  items: [
    {
      name: '',
      description: '',
      workDays: '',
      quantity: 1,
      unit: '份',
      price: ''
    }
  ],
  contract: {
    page1: {
      partyA: '',
      partyB: '鋭皇國際股份有限公司',
      projectName: '',
      totalAmount: '',
      estimatedWorkDays: 'X',
      contractYear: '',
      contractMonth: '',
      contractDay: '',
      depositAmount: '',
      paymentMethod: {
        singlePayment: false,
        singlePaymentDate: {
          year: '',
          month: '',
          day: ''
        },
        deposit: false,
        depositAmount: '',
        depositDate: {
          year: '',
          month: '',
          day: ''
        },
        finalPaymentAmount: '',
        finalPaymentDate: {
          year: '',
          month: '',
          day: ''
        }
      },
      paymentType: {
        cash: false,
        transfer: false,
        check: false,
        checkDate: {
          year: '',
          month: '',
          day: ''
        }
      }
    },
    page2: {
      designProposalCount: '',
      responseDay: '',
      designRevisionCount: '',
      printRevisionCount: '',
      providedItems: ''
    },
    page3: {
      otherAgreements: '',
      partyA: {
        companyName: '',
        representative: '',
        address: '',
        phone: '',
        taxId: ''
      },
      partyB: {
        companyName: '鋭皇國際股份有限公司',
        representative: '陳淑貞',
        address: '10467 台北市中山區松江路 220 號 4 樓之 5',
        phone: '02-25623385',
        taxId: '83213438'
      }
    }
  }
} 