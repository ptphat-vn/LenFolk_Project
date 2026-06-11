// Tiện ích dùng chung cho các file path — giảm lặp code.

const bearer = [{ bearerAuth: [] }];

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'MongoDB ObjectId',
};

const errorRef = { $ref: '#/components/schemas/ErrorResponse' };
const jsonError = { 'application/json': { schema: errorRef } };

// Response 200 chứa 1 document theo schema ref
const okData = (ref, desc = 'Thành công') => ({
  description: desc,
  content: { 'application/json': { schema: {
    type: 'object',
    properties: { success: { type: 'boolean', example: true }, data: { $ref: `#/components/schemas/${ref}` } },
  } } },
});

// Response 200 dạng list
const okList = (ref, desc = 'Danh sách') => ({
  description: desc,
  content: { 'application/json': { schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      results: { type: 'integer', example: 1 },
      data: { type: 'array', items: { $ref: `#/components/schemas/${ref}` } },
    },
  } } },
});

const okMessage = (desc = 'Thành công') => ({
  description: desc,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessMessage' } } },
});

const err = (desc) => ({ description: desc, content: jsonError });

// Request body JSON theo schema ref
const jsonBody = (ref, required = true) => ({
  required,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } },
});

// Request body multipart theo schema ref
const formBody = (ref, required = true) => ({
  required,
  content: { 'multipart/form-data': { schema: { $ref: `#/components/schemas/${ref}` } } },
});

module.exports = { bearer, idParam, okData, okList, okMessage, err, jsonBody, formBody };
