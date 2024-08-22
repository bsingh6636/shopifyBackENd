import express from 'express'
import { getCustomerDistributionByCity, getCustomerLifetimeValueByCohort, getNewCustomersOverTime, getRepeatCustomersOverTime, getSalesData, getSalesGrowthRateOverTime } from '../controllers/order.controller.js'

const router = express.Router()

router.get('/sales-data',getSalesData)
router.get('/growth-rate-over-time',getSalesGrowthRateOverTime)
router.get('/new_customer',getNewCustomersOverTime)
router.get('/repeat-customer',getRepeatCustomersOverTime)
router.get('/value-cohorrts',getCustomerLifetimeValueByCohort)
router.get('/distribtution-city',getCustomerDistributionByCity)

export default router ;