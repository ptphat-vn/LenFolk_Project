/**
 * @swagger
 * tags:
 *   name: TransactionRecords
 *   description: TransactionRecords management
 */

const express = require('express');
const router = express.Router();

const transactionRecordController = require('../controllers/transaction-record.controller');
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTransactionRecordSchema, updateTransactionRecordSchema } = require('../validations/transaction-record.validation');

router.use(verifyToken);

router
  .route('/')
/**
 * @swagger
 * /transaction-records:
 *   get:
 *     tags: [TransactionRecords]
 *     summary: Get transaction-record
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
.get(transactionRecordController.getAll)
/**
 * @swagger
 * /transaction-records:
 *   post:
 *     tags: [TransactionRecords]
 *     summary: Post transaction-record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.post(validate(createTransactionRecordSchema), transactionRecordController.createOne);

router
  .route('/:id')
/**
 * @swagger
 * /transaction-records/{id}:
 *   get:
 *     tags: [TransactionRecords]
 *     summary: Get transaction-record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.get(transactionRecordController.getOne)
/**
 * @swagger
 * /transaction-records/{id}:
 *   patch:
 *     tags: [TransactionRecords]
 *     summary: Patch transaction-record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
.patch(verifyAdmin, validate(updateTransactionRecordSchema), transactionRecordController.updateOne)
/**
 * @swagger
 * /transaction-records/{id}:
 *   delete:
 *     tags: [TransactionRecords]
 *     summary: Delete transaction-record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
.delete(verifyAdmin, transactionRecordController.deleteOne);

module.exports = router;
