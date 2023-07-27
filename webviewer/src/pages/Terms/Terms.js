import React, { useEffect, useMemo, useState } from 'react';

import { Header } from 'components/Header';

import { Container } from './Terms.styles';
import { RemoteServerNotification } from 'components/RemoteServerNotification';

export const Terms = () => {
  return (
    <>
      <RemoteServerNotification />
      <Header />
      <Container>
        <div>
          <h1>Soilmate.ai Terms of Service</h1>
          <span>Version 1.0. Issued 20 January 2021 </span>
          <ol>
            <li>
              <h3>General Provisions</h3>
              <p>
                The Terms of Service set out the rules and technical conditions of the use
                of the Soilmate.ai Service.
                <br /> The Service is provided by QuantumSoftware Sp. z o.o. Modlińska st.
                6A/223 03-216 Warszawa, Poland. <br />
                Every User must read and comply with the Terms of Service. The
                commencement of the use of the Soilmate.ai Sevice shall be tantamount to
                accepting the Soilmate.ai Terms of Service, with no need to conclude a
                separate agreement.
                <br /> The copyright in the Soilmate.ai is protected under the Act on
                copyright and related rights of 4 February 1994 (Journal of Laws 1994 No.
                24, Item 83, as amended).
                <br /> The Terms of Service shall be governed by and construed in
                accordance with Polish law. <br />
                The Terms of Service shall be effective from 20 January 2021 until further
                notice.
              </p>
            </li>
            <li>
              <h3>Definitions</h3>
              <p>
                The terms used in the Terms of Service shall have the following meaning:
                <br />
                <b>Soilmate.ai Service</b> – the cloud service where the Service User
                requests and manages (requests, analyses, imports, exports) data. <br />
                <b></b>Service User – Soilmate.ai customer using an activated Soilmate.ai
                Service.
                <br />
                <b>Activation </b>– enabling the service as indicated herein. <br />
                <b>Login</b> – the User’s identifier used to log in to the Soilmate.ai
                Cloud.
                <br />
                <b>Password</b> – a string of characters used by the Service User to log
                in to the Soilmate.ai. <br />
                <b>Data</b> – all files and data in database stored by the User and
                Soilmate.ai Service.
                <br />
                <b>Agreement</b> – the service agreement concluded by and between the User
                and Soilmate.ai. <br />
                <b>Terms of Service </b>– these Terms of Service. <br />
                <b>Soilmate.ai Privacy Policy</b> – a separate document informing the
                Users of what data are collected from them and how they will be used as
                well as describing the rules of the processing by Soilmate.ai of the Users
                data.
                <br />
                <b>Soilmate.ai</b> – QuantumSoftware Sp. z o.o. seated in Modlińska st.
                6A/223 03-216 Warszawa, Poland.
              </p>
            </li>
            <li>
              <h3>Electronically supplied services</h3>
              <p>
                The services provided in the Soilmate.ai are services supplied
                electronically by QuantumSoftware in accordance with the Terms of Service.
                <br />
                Through the Soilmate.ai, regardless of the file format, the User and
                Soilmate.ai may:
                <ul>
                  <li>Request analytics</li>
                </ul>
              </p>
            </li>
            <li>
              <h3>Terms and Conditions of service provision</h3>
              <p>
                Soilmate.ai reserves the right to discontinue the provision of the
                Soilmate.ai service if the User infringes the Terms of Service or the
                applicable law.
                <br />
                The following shall be prohibited: <br />
                <ol>
                  <li>
                    carrying out activities aimed at disrupting or precluding proper
                    functioning of the Soilmate.ai Service,
                  </li>
                  <li>
                    carrying out activities aimed at unauthorized access to the
                    Soilmate.ai Service, and content detrimental to the reputation of
                    Soilmate.ai.
                  </li>
                </ol>
                Soilmate.ai shall immediately notify the User in the occurrence of an
                incident described above.
                <br />
                In connection with the use of Soilmate.ai Service, it shall also be
                prohibited to make any declarations on behalf of persons without due
                authorization granted by them to do so or to impersonate anyone, e.g. by
                using someone else’s personal data, including another person’s e-mail
                addresses.
              </p>
              <p>
                Soilmate.ai reserves the right to discontinue the provision of Soilmate.ai
                Service in the event of failure or technical upgrade of the Soilmate.ai
                Service or during maintenance breaks. Soilmate.ai shall make every
                endeavor for such unavailability of the Soilmate.ai Service to cause the
                Users the most minor inconvenience possible.
              </p>
              <p>
                Soilmate.ai shall exercise due care in updating Soilmate.ai on an ongoing
                basis in accordance with the changing legal regulations and technical
                requirements.
              </p>
              <p>
                <b>Discontinuation of Services.</b> Soilmate.ai can discontinue Service
                for User if no activities for 6 months. Soilmate.ai will notify User at
                least 1 month before discontinuing of Service.
                <br />
                Soilmate will notify Customer at least 1 month before significantly
                modifying a Customer-facing Soilmate API in a backwards-incompatible
                manner. Nothing in this Section 1.4(d) (Discontinuation of Services)
                limits Soilmate.ai ability to make changes required to comply with
                applicable law, address a material security risk, or avoid a substantial
                economic or material technical burden.
              </p>
            </li>
            <li>
              <h3>Payments</h3>
              <p>
                Soilmate.ai Services are provided through a per-request fee. The fee is
                calculated based on the AoI area and the model type. Soilmate.ai Service
                charges Users from the internal wallet. The wallet should be top up by
                User via the proposed payment methods.
                <br />
                All payments may be initiated explicitly by User. All fees are
                non-refundable.
              </p>
            </li>
            <li>
              <h3>Responsibility</h3>
              <p>
                Soilmate.ai shall not be liable for any loss or damage arising from the
                following:
                <ol>
                  <li>
                    disclosure by the User of the User’s login or password to the Service
                    to any third parties,
                  </li>
                  <li>
                    measures for the protection of the equipment or devices used by the
                    User to access Soilmate.ai Service from malware or unauthorized
                    third-party access,
                  </li>
                  <li>
                    any interruptions in the supply of the Service for reasons not
                    attributable to Soilmate.ai,
                  </li>
                  <li>Internet failure,</li>
                  <li>
                    unavailability of Soilmate.ai Service as a result of unforeseeable
                    events,
                  </li>
                  <li>
                    Internet-related risks, e.g. hack attacks, viruses infecting
                    Soilmate.ai Service,
                  </li>
                  <li>
                    misuse of Soilmate.ai Service, its features, other than only the
                    consequence of failure to comply with the Terms of Service.
                  </li>
                  The Users shall be solely responsible for signing up for and using the
                  Soilmate.ai Service. Soilmate.ai shall not be liable for any of the
                  following arising from the use of the Soilmate.ai Service:
                  <ol>
                    <li>
                      any damage suffered by the User due to the User’s loss of profit or
                      stoppage,
                    </li>
                    <li>any damage caused by the User’s loss of business information.</li>
                  </ol>
                </ol>
                The User shall be responsible for using Soilmate.ai Service solely in
                circumstances ensuring communication confidentiality and preventing
                unauthorized third-party access to any information uploaded to Soilmate.ai
                Service.
              </p>
            </li>
            <li>
              <h3>Applicable third-party terms of service</h3>
              <p>
                Geo Location Terms. Soilmate.ai Service includes and makes use of certain
                functionality and services provided by third parties that allow us to
                include maps, geocoding, places, and other Content from Google, Inc.
                (“Google”) as part of the Services (the “Geo-Location Services”). Your use
                of the Geo-Location Services is subject to Google’s then current Terms of
                Use for Google Maps/Google Earth (
                <a href='http://www.google.com/intl/en_us/help/terms_maps.html'>
                  http://www.google.com/intl/en_us/help/terms_maps.html
                </a>
                ), and by using the Geo-Location Services, you are agreeing to be bound by
                Google’s Terms of Use.
              </p>
              <p>
                API. Subject to the terms and conditions contained in these Terms, we
                hereby grant you a non-exclusive, non-transferable right and license to
                access the third-party application programming interface available through
                the Soilmate.ai Service (collectively, the “API”) for the Permitted
                Purposes in connection with use of the Services as contemplated herein,
                conditioned on your compliance with these Terms. Such license is granted
                subject to any open source license terms presented prior to accessing the
                API. You will not make excessive or unrequired API calls. If you are
                deemed to be abusing the API network, you may be throttled or denied to
                stop potential attacks. You agree to comply with the Google API Terms of
                Service available at{' '}
                <a href='https://developers.google.com/terms/'>
                  https://developers.google.com/terms/
                </a>
                .
              </p>
            </li>
            <li>
              <h3>Complaint handling procedure</h3>
              <p>
                The User may lodge a complaint related to the use of the Soillmate.ai
                Service.
              </p>
              <p>
                Complaints should be lodged with Soilmate.ai: by electronic mail to the
                following address: support@soilmate.ai, in writing to the following
                address: QuantumSoftware Sp. z o.o. Modlińska st. 6A/223 03-216 Warszawa,
                Poland.
              </p>
              <p>
                Complaints must be lodged no later than 7 (seven) days after the date on
                which the reason for the complaint occurred.
              </p>
              <p>
                Complaints shall be examined within 30 (thirty) days of their receipt
                (i.e. the date of the delivery of the complaint concerned to Soilmate.ai).
                The User shall be notified of the result of the complaint handling manner
                immediately after its examination.
              </p>
              <p>
                In particularly complicated cases, where the examination of a complaint
                requires additional activities, the time limit for responding may be
                extended to 60 (sixty) days of the receipt of the complaint concerned by
                Soilmate.ai.
              </p>
            </li>
          </ol>
          <div>
            <h3>Final provisions</h3>
            <p>
              Any disputes between Soilmate.ai and Users shall be settled by the competent
              court of law having jurisdiction in accordance with the applicable rules.
            </p>
            <p>
              Soilmate.ai reserves the right to discontinue all or part of the Services
              subject to a prior notification to the Service Recipients 14 days in
              advance.
            </p>
            <p>
              These Terms of Service are available at the Website:
              <br />
              <a href='https://portal.soilmate.ai/terms'>
                https://portal.soilmate.ai/terms
              </a>
            </p>
            <p>
              These Terms of Service may be amended by Soilmate.ai at any time. Any
              amendments to the Terms of Service shall apply from the date indicated in
              such amended Terms of Service published at the Website.
            </p>
          </div>
        </div>
      </Container>
    </>
  );
};
