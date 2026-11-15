# Salt Use Guidance — source review

Reviewed 2026-11-15. These sources support the educational Intervene card only;
they do not add evidence to the case study or establish any scenario's safety.

| Published source | Verified content and use |
| --- | --- |
| [FHWA-RD-95-202, June 1996, chapter 4](https://www.fhwa.dot.gov/publications/research/safety/95202/003.cfm) | Sections 4.1–4.3 discuss monitoring pavement temperature/trend, precipitation, plowing before additional chemical, and treatment forms. Section 4 says published rates depend on local conditions and experience. Supports the unknown-condition and snow summaries. |
| [FHWA-RD-95-202, Appendix C](https://www.fhwa.dot.gov/publications/research/safety/95202/006.cfm) | C.2 and tables 8–12 require event type, temperature range **and trend**, and sometimes surface/traffic conditions. Frost table 11 also uses dew point. Tables discuss monitoring above freezing and limits on chemicals below 15°F when steady/falling. Supports condition-specific summaries; does not establish a matching rate from the two UI inputs. |
| [NJDOT Winter Readiness overview](https://www.nj.gov/transportation/about/winter/) | Describes anti-icing materials and plowing when appropriate; intensity, duration, and temperature affect operations. Linked as local practice context, not a numeric rate source. |
| [EPA current national aquatic-life criteria table](https://www.epa.gov/wqc/national-recommended-water-quality-criteria-aquatic-life-criteria-table) | Chloride row still lists the 1988 criteria: freshwater acute 860,000 µg/L and chronic 230,000 µg/L, equivalent to 860 and 230 mg/L. These are water concentrations, not road application rates or a Stony Brook prediction. |
| [EPA Ambient Water Quality Criteria for Chloride—1988](https://www.epa.gov/sites/default/files/2018-08/documents/chloride-aquatic-life-criteria-1988.pdf#page=15) | Printed p. 8 (PDF p. 15): dissolved chloride associated with sodium; 860 mg/L **one-hour average**, 230 mg/L **four-day average**, each not exceeded more than once every three years on average. The document cautions about other associated cations. Printed pp. 8–9 distinguish national recommendations from adopted state standards. |

## Rate and unit decisions

The advisor displays **no numerical application rate**, including for plausible
temperatures. The compact input set lacks trend, storm intensity, chemical form,
moisture, timing, and frost dew point/traffic; broad “Ice or freezing rain” also
combines distinct conditions. Every result therefore starts with “No verified
application rate available for these conditions.” The calculator's editable
lb/lane-mile input remains a separate hypothetical assumption.

FHWA Appendix C spread-rate tables use kg/lane-km (lb/lane-mi), expressed as dry
chemical mass; liquid entries are dry-equivalent chemical, **not gallons of
brine**. No table entry is copied into the calculator. The material engine uses
2,000 lb per US short ton; mass and cost do not imply environmental or safety
outcomes. EPA water concentrations are never converted into road rates.

The existing Stony Brook case data cannot quantify scenario-specific stream
effects, drainage paths, or chloride predictions. The advisor supplies educational
practice context, not crew instructions, a guaranteed safe amount, or legal
compliance advice.
