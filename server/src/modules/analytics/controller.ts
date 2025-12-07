import { Request, Response } from 'express';
import { z } from 'zod';
import Booking from '@/models/booking';
import logger from '@/utils/logger';
import mongoose from 'mongoose';

const DAY_MS = 24 * 60 * 60 * 1000;

const controller = {
    // DAILY SALES (bookings & guests with category breakdown)
    getDailySales: async (req: Request, res: Response, next: Function) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.span ? Math.max(1, parseInt(parsed.data.span, 10)) : 30;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * DAY_MS);
            const ownerId = res.locals.userID as string;

            const data = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$bookingAt' } },
                            category: '$category'
                        },
                        bookings: { $sum: 1 },
                        guests: { $sum: '$numberOfGuests' }
                    }
                },
                {
                    $group: {
                        _id: '$_id.date',
                        totalBookings: { $sum: '$bookings' },
                        totalGuests: { $sum: '$guests' },
                        categories: {
                            $push: {
                                category: '$_id.category',
                                bookings: '$bookings',
                                guests: '$guests'
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: '$_id',
                        bookings: '$totalBookings',
                        guests: '$totalGuests',
                        breakfast: {
                            $let: {
                                vars: {
                                    cat: {
                                        $first: {
                                            $filter: {
                                                input: '$categories',
                                                cond: { $eq: ['$$this.category', 'breakfast'] }
                                            }
                                        }
                                    }
                                },
                                in: {
                                    bookings: { $ifNull: ['$$cat.bookings', 0] },
                                    guests: { $ifNull: ['$$cat.guests', 0] }
                                }
                            }
                        },
                        lunch: {
                            $let: {
                                vars: {
                                    cat: {
                                        $first: {
                                            $filter: {
                                                input: '$categories',
                                                cond: { $eq: ['$$this.category', 'lunch'] }
                                            }
                                        }
                                    }
                                },
                                in: {
                                    bookings: { $ifNull: ['$$cat.bookings', 0] },
                                    guests: { $ifNull: ['$$cat.guests', 0] }
                                }
                            }
                        }
                    }
                },
                { $sort: { date: 1 } },
            ]);

            return res.status(200).json({ success: true, data });
        } catch (error) {
            logger.error('Error in getDailySales', error);
            next(error);
        }
    },

    // FORECAST (guests only)
    getForecast: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ horizon: z.string().optional(), window: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const horizon = parsed.data.horizon ? Math.max(1, parseInt(parsed.data.horizon, 10)) : 7;
            const ownerId = res.locals.userID as string;

            const from = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
            const to = new Date();

            const hist = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingAt' } }, guests: { $sum: '$numberOfGuests' } } },
                { $project: { _id: 0, date: '$_id', guests: 1 } },
                { $sort: { date: 1 } },
            ]);

            const dayMs = 24 * 60 * 60 * 1000;

            const weekdayTotals: number[] = Array(7).fill(0);
            const weekdayCounts: number[] = Array(7).fill(0);

            for (const row of hist) {
                const d = new Date(row.date + 'T00:00:00.000Z');
                const w = d.getUTCDay();
                weekdayTotals[w] += row.guests;
                weekdayCounts[w] += 1;
            }

            const weekdayAvg: number[] = Array(7).fill(0);
            let globalTotal = 0;
            let globalDays = 0;

            for (let w = 0; w < 7; w++) {
                if (weekdayCounts[w] > 0) {
                    weekdayAvg[w] = Math.round(weekdayTotals[w] / weekdayCounts[w]);
                    globalTotal += weekdayTotals[w];
                    globalDays += weekdayCounts[w];
                }
            }

            const globalAvg = globalDays > 0 ? Math.round(globalTotal / globalDays) : 0;

            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);

            const forecast = Array.from({ length: horizon }).map((_, i) => {
                const d = new Date(today.getTime() + (i + 1) * dayMs);
                const date = d.toISOString().slice(0, 10);
                const weekday = d.getUTCDay();
                const base = weekdayAvg[weekday] ?? globalAvg;
                return { day: i + 1, date, guests: base };
            });

            return res.status(200).json({ success: true, horizon, forecast });
        } catch (error) {
            logger.error('Error in getForecast', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // FUNNEL
    getFunnel: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.span ? Math.max(1, parseInt(parsed.data.span, 10)) : 7;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * DAY_MS);
            if (from > to) return res.status(400).json({ success: false, message: 'Invalid date range' });

            const ownerId = res.locals.userID as string;

            const rows = await (Booking as any).aggregate([
                { $match: { bookingAt: { $gte: from, $lte: to } } },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $project: { _id: 0, status: '$_id', count: 1 } },
            ]);

            const byStatus = Object.fromEntries(rows.map((r: any) => [r.status, r.count])) as Record<string, number>;
            const pending = byStatus['pending'] || 0;
            const accepted = byStatus['accepted'] || 0;
            const paymentPending = byStatus['payment pending'] || 0;
            const confirmed = byStatus['confirmed'] || 0;
            const executed = byStatus['executed'] || 0;
            const rejected = byStatus['rejected'] || 0;

            const pct = (n: number, d: number) => (d > 0 ? Number(((n / d) * 100).toFixed(1)) : 0);
            const totalPipeline = pending + accepted + paymentPending + confirmed;
            const conversions = {
                pending_to_confirmed: pct(confirmed, pending),
                confirmed_to_executed: pct(executed, confirmed),
                overall_to_executed: pct(executed, totalPipeline),
            };
            return res.status(200).json({
                success: true,
                data: {
                    counts: { pending, accepted, paymentPending, confirmed, executed, rejected },
                    conversions,
                },
            });
        } catch (error) {
            logger.error('Error in getFunnel', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // CATEGORY PERFORMANCE (guests only, no rate)
    getCategoryPerformance: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success)
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.span ? Math.max(1, parseInt(parsed.data.span, 10)) : 30;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * 24 * 60 * 60 * 1000);
            const ownerId = res.locals.userID as string;

            const rows = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurantID',
                        foreignField: '_id',
                        as: 'restaurant',
                    },
                },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: '$category', bookings: { $sum: 1 }, guests: { $sum: '$numberOfGuests' } } },
                { $project: { _id: 0, category: '$_id', bookings: 1, guests: 1 } },
                { $sort: { category: 1 } },
            ]);

            const data = rows.map((r: any) => ({
                category: r.category,
                bookings: r.bookings,
                guests: r.guests,
                avgPartySize: r.bookings > 0 ? Number((r.guests / r.bookings).toFixed(2)) : 0,
            }));

            return res.status(200).json({ success: true, data });
        } catch (error) {
            logger.error('Error in getCategoryPerformance', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // HEATMAP
    getHeatmap: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.span ? Math.max(1, parseInt(parsed.data.span, 10)) : 30;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * DAY_MS);
            if (from > to) return res.status(400).json({ success: false, message: 'Invalid date range' });
            const ownerId = res.locals.userID as string;

            const rows = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: { weekday: { $dayOfWeek: '$bookingAt' }, hour: { $hour: '$bookingAt' } }, count: { $sum: 1 } } },
                { $project: { _id: 0, weekday: '$_id.weekday', hour: '$_id.hour', count: 1 } },
                { $sort: { weekday: 1, hour: 1 } },
            ]);

            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            logger.error('Error in getHeatmap', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // COMPARE (bookings & guests only)
    getCompare: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), days: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.days ? Math.max(1, parseInt(parsed.data.days, 10)) : 7;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * DAY_MS);
            if (from > to) return res.status(400).json({ success: false, message: 'Invalid date range' });

            const spanMsRaw = to.getTime() - from.getTime();
            const spanMs = spanMsRaw > 0 ? spanMsRaw : DAY_MS;
            const prevTo = new Date(from.getTime());
            const prevFrom = new Date(prevTo.getTime() - spanMs);
            const ownerId = res.locals.userID as string;

            const agg = async (fromDate: Date, toDate: Date) => (Booking as any)
                .aggregate([
                    { $match: { status: 'executed', bookingAt: { $gte: fromDate, $lte: toDate } } },
                    { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                    { $unwind: '$restaurant' },
                    { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                    { $group: { _id: null, bookings: { $sum: 1 }, guests: { $sum: '$numberOfGuests' } } },
                    { $project: { _id: 0, bookings: 1, guests: 1 } },
                ])
                .then((r: any[]) => (r[0] || { bookings: 0, guests: 0 }));

            const [current, previous] = await Promise.all([agg(from, to), agg(prevFrom, prevTo)]);
            const growthPct = (a: number, b: number) => (b === 0 ? (a > 0 ? 100 : 0) : Number((((a - b) / b) * 100).toFixed(1)));
            const diff = (a: number, b: number) => a - b;

            return res.status(200).json({
                success: true,
                days: Math.max(1, Math.ceil(spanMs / DAY_MS)),
                current,
                previous,
                growth: {
                    bookings: growthPct(current.bookings, previous.bookings),
                    guests: growthPct(current.guests, previous.guests),
                },
                diff: {
                    bookings: diff(current.bookings, previous.bookings),
                    guests: diff(current.guests, previous.guests),
                },
            });
        } catch (error) {
            logger.error('Error in getCompare', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // CSV: category performance (guests only, no rate)
    exportCategoryCsv: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success)
                return res
                    .status(400)
                    .json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const from = parsed.data.from
                ? new Date(parsed.data.from)
                : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const to = parsed.data.to ? new Date(parsed.data.to) : new Date();
            const ownerId = res.locals.userID as string;

            const rows = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                {
                    $lookup: {
                        from: 'restaurants',
                        localField: 'restaurantID',
                        foreignField: '_id',
                        as: 'restaurant',
                    },
                },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: '$category', bookings: { $sum: 1 }, guests: { $sum: '$numberOfGuests' } } },
                { $project: { _id: 0, category: '$_id', bookings: 1, guests: 1 } },
                { $sort: { category: 1 } },
            ]);

            const header = 'category,bookings,guests,avgPartySize\n';
            const body = rows
                .map((r: any) => {
                    const avg = r.bookings > 0 ? (r.guests / r.bookings).toFixed(2) : '0';
                    return `${r.category},${r.bookings},${r.guests},${avg}`;
                })
                .join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="category-performance.csv"');
            return res.status(200).send(header + body);
        } catch (error) {
            logger.error('Error in exportCategoryCsv', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    // CSV: heatmap
    exportHeatmapCsv: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional(), span: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const spanDays = parsed.data.span ? Math.max(1, parseInt(parsed.data.span, 10)) : 30;
            const hasFrom = !!parsed.data.from;
            const hasTo = !!parsed.data.to;
            const to = hasTo ? new Date(parsed.data.to as string) : new Date();
            const from = hasFrom ? new Date(parsed.data.from as string) : new Date(to.getTime() - spanDays * DAY_MS);
            if (from > to) return res.status(400).json({ success: false, message: 'Invalid date range' });
            const ownerId = res.locals.userID as string;

            const rows = await (Booking as any).aggregate([
                { $match: { status: 'executed', bookingAt: { $gte: from, $lte: to } } },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                { $group: { _id: { weekday: { $dayOfWeek: '$bookingAt' }, hour: { $hour: '$bookingAt' } }, count: { $sum: 1 } } },
                { $project: { _id: 0, weekday: '$_id.weekday', hour: '$_id.hour', count: 1 } },
                { $sort: { weekday: 1, hour: 1 } },
            ]);

            const header = 'weekday,hour,count\n';
            const body = rows.map((r: any) => `${r.weekday},${r.hour},${r.count}`).join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="heatmap.csv"');
            return res.status(200).send(header + body);
        } catch (error) {
            logger.error('Error in exportHeatmapCsv', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },


    // CUSTOMER SEGMENTATION (no revenue fields)
    getCustomerSegments: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const from = parsed.data.from ? new Date(parsed.data.from) : undefined;
            const to = parsed.data.to ? new Date(parsed.data.to) : undefined;
            const ownerId = res.locals.userID as string;

            const matchDates: any = {};
            if (from) matchDates.$gte = from;
            if (to) matchDates.$lte = to;

            const pipeline: any[] = [];
            const statusFilter = { $in: ['accepted', 'confirmed', 'executed'] };
            const matchStage: any = { status: statusFilter };
            if (from || to) matchStage.bookingAt = matchDates;
            pipeline.push(
                { $match: matchStage },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                {
                    $group: {
                        _id: '$userID',
                        visits: { $sum: 1 },
                        guests: { $sum: '$numberOfGuests' },
                        firstVisit: { $min: '$bookingAt' },
                        lastVisit: { $max: '$bookingAt' },
                        avgPartySize: { $avg: '$numberOfGuests' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userID: '$_id',
                        visits: 1,
                        guests: 1,
                        firstVisit: 1,
                        lastVisit: 1,
                        avgPartySize: { $round: ['$avgPartySize', 2] },
                    },
                },
                { $sort: { visits: -1 } },
            );

            const rows = await (Booking as any).aggregate(pipeline);

            const now = new Date();
            const withSegments = rows.map((r: any) => {
                const daysSinceLast = Math.floor((now.getTime() - new Date(r.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
                const freq = r.visits;
                const segment = freq <= 1 ? 'new' : freq <= 4 ? 'regular' : 'loyal';
                const churnRisk = daysSinceLast > 60 ? 'high' : daysSinceLast > 30 ? 'medium' : 'low';
                return { ...r, segment, churnRisk };
            });

            return res.status(200).json({ success: true, data: withSegments });
        } catch (error) {
            logger.error('Error in getCustomerSegments', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    exportCustomerSegmentsCsv: async (req: Request, res: Response) => {
        try {
            const schema = z.object({ from: z.string().optional(), to: z.string().optional() });
            const parsed = schema.safeParse(req.query);
            if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid query', error: z.treeifyError(parsed.error) });

            const from = parsed.data.from ? new Date(parsed.data.from) : undefined;
            const to = parsed.data.to ? new Date(parsed.data.to) : undefined;
            const ownerId = res.locals.userID as string;

            const matchDates: any = {};
            if (from) matchDates.$gte = from;
            if (to) matchDates.$lte = to;

            const pipeline: any[] = [];
            const statusFilter = { $in: ['accepted', 'confirmed', 'executed'] };
            const matchStage: any = { status: statusFilter };
            if (from || to) matchStage.bookingAt = matchDates;
            pipeline.push(
                { $match: matchStage },
                { $lookup: { from: 'restaurants', localField: 'restaurantID', foreignField: '_id', as: 'restaurant' } },
                { $unwind: '$restaurant' },
                { $match: { 'restaurant.owner': new mongoose.Types.ObjectId(ownerId) } },
                {
                    $group: {
                        _id: '$userID',
                        visits: { $sum: 1 },
                        guests: { $sum: '$numberOfGuests' },
                        firstVisit: { $min: '$bookingAt' },
                        lastVisit: { $max: '$bookingAt' },
                        avgPartySize: { $avg: '$numberOfGuests' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        userID: '$_id',
                        visits: 1,
                        guests: 1,
                        firstVisit: 1,
                        lastVisit: 1,
                        avgPartySize: { $round: ['$avgPartySize', 2] },
                    },
                },
                { $sort: { visits: -1 } },
            );

            const rows = await (Booking as any).aggregate(pipeline);
            const now = new Date();

            const lines = rows.map((r: any) => {
                const daysSinceLast = Math.floor((now.getTime() - new Date(r.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
                const freq = r.visits;
                const segment = freq <= 1 ? 'new' : freq <= 4 ? 'regular' : 'loyal';
                const churnRisk = daysSinceLast > 60 ? 'high' : daysSinceLast > 30 ? 'medium' : 'low';
                return `${r.userID},${r.visits},${r.guests},${r.avgPartySize},${segment},${churnRisk},${new Date(r.firstVisit).toISOString()},${new Date(r.lastVisit).toISOString()}`;
            });

            const header = 'userID,visits,guests,avgPartySize,segment,churnRisk,firstVisit,lastVisit\n';
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="customer-segments.csv"');
            return res.status(200).send(header + lines.join('\n'));
        } catch (error) {
            logger.error('Error in exportCustomerSegmentsCsv', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

};

export default controller;
